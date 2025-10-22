import json
import os
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import classification_report
from sklearn.linear_model import LogisticRegression

# Optional: you can swap the classifier to RandomForestClassifier for non-linear decision boundaries
# from sklearn.ensemble import RandomForestClassifier


def load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    # Drop rows with missing target (Medal)
    df = df.dropna(subset=["Medal"])
    return df


def prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray, list, list]:
    # Define target: Medal class (Gold/Silver/Bronze). We'll ignore non-medal rows by dropping NAs earlier
    y = df["Medal"].astype(str).values

    # Select a subset of useful features available widely in the dataset
    # You can tweak these depending on data quality
    candidate_numerical = ["Age", "Rank"]
    candidate_categorical = [
        "Gender",  # Male/Female
        "NOC",      # Country code
        "Discipline",  # Abbrev
        "Sport",    # Full sport
        # You can add: "Event" but very high cardinality may increase model size
    ]

    X = df[candidate_numerical + candidate_categorical].copy()

    # Handle numeric missing values simply
    for col in candidate_numerical:
        if col in X:
            X[col] = pd.to_numeric(X[col], errors="coerce")
            X[col] = X[col].fillna(X[col].median())

    # Drop rows where categorical are missing (simple strategy)
    X = X.dropna(subset=candidate_categorical)
    # Align target with filtered X using label-based index
    y = df.loc[X.index, "Medal"].astype(str).values

    return X, y, candidate_numerical, candidate_categorical


def build_pipeline(numeric: list, categorical: list) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(with_mean=False), numeric),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=True), categorical),
        ]
    )

    clf = LogisticRegression(
        max_iter=1000,
        solver="saga",
        multi_class="multinomial",
    )
    # For RandomForest, replace above by:
    # clf = RandomForestClassifier(n_estimators=300, random_state=42)

    model = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("clf", clf),
    ])

    return model


def train_and_evaluate(model: Pipeline, X: pd.DataFrame, y: np.ndarray):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    report = classification_report(y_test, y_pred, digits=4)
    print("Classification report:\n", report)

    return model


def export_onnx(model: Pipeline, X_sample: pd.DataFrame, classes: list, onnx_path: str, classes_path: str):
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType, StringTensorType, TensorType

    # Build initial types matching the input columns order and dtypes
    initial_types: list[tuple[str, TensorType]] = []
    for col in X_sample.columns:
        if np.issubdtype(X_sample[col].dtype, np.number):
            initial_types.append((col, FloatTensorType([None, 1])))
        else:
            initial_types.append((col, StringTensorType([None, 1])))

    onnx_model = convert_sklearn(
        model,
        initial_types=initial_types,
        options={id(model): {"zipmap": False}},  # so outputs are raw probability arrays
        target_opset=17,
    )

    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f)

    print(f"Saved ONNX model to {onnx_path}")
    print(f"Saved classes to {classes_path}")


def main():
    csv_path = os.environ.get("DATASET", "2020_Olympics_Dataset_Cleaned (1).csv")
    out_dir = os.environ.get("OUT_DIR", "model")
    os.makedirs(out_dir, exist_ok=True)

    df = load_dataset(csv_path)
    X, y, num_cols, cat_cols = prepare_features(df)

    # Preserve class order for mapping softmax outputs to labels
    classes = sorted(pd.unique(y))

    model = build_pipeline(num_cols, cat_cols)
    model = train_and_evaluate(model, X, y)

    onnx_path = os.path.join(out_dir, "medal_classifier.onnx")
    classes_path = os.path.join(out_dir, "medal_classes.json")

    # Export uses a small sample to infer input dtypes
    export_onnx(model, X.iloc[:2], classes, onnx_path, classes_path)


if __name__ == "__main__":
    main()
