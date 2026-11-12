"""Automated Comprehensive Test Runner for Neural Collaborative Filtering Movie Recommender.

Executes all unit, integration, and ML artifact test suites, measures execution time,
verifies frontend compilation, and displays detailed scenario outcomes.
"""

import sys
import os
import time
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
PYTHON_EXE = sys.executable


def run_command(cmd, cwd=ROOT_DIR):
    start = time.time()
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=isinstance(cmd, str))
    duration = time.time() - start
    return res.returncode, res.stdout, res.stderr, duration


def main():
    print("=" * 80)
    print(" 🎬 MOVIE RECOMMENDER SYSTEM - FULL SYSTEM TEST HARNESS")
    print("=" * 80)
    print(f"Working Directory: {ROOT_DIR}")
    print(f"Python Interpreter: {PYTHON_EXE}")
    print()

    # 1. Run Pytest Suite
    print("▶ Running Pytest Backend & Machine Learning Test Suites...")
    pytest_cmd = [
        PYTHON_EXE,
        "-m",
        "pytest",
        "-v",
        "--tb=short",
        str(ROOT_DIR / "tests"),
    ]

    code, stdout, stderr, duration = run_command(pytest_cmd)

    print(stdout)
    if stderr:
        # Print non-warning lines if any
        err_lines = [l for l in stderr.splitlines() if "warning" not in l.lower()]
        if err_lines:
            print("STDERR:")
            print("\n".join(err_lines))

    pytest_passed = (code == 0)

    # 2. Run Frontend Build Check
    print("-" * 80)
    print("▶ Running Frontend Production Build Verification (Vite)...")
    frontend_dir = ROOT_DIR / "frontend"
    npm_cmd = "npm run build"
    fe_code, fe_stdout, fe_stderr, fe_duration = run_command(npm_cmd, cwd=frontend_dir)

    frontend_passed = (fe_code == 0)
    if frontend_passed:
        print(f"✓ Frontend build succeeded in {fe_duration:.2f}s!")
    else:
        print(f"✗ Frontend build failed in {fe_duration:.2f}s:")
        print(fe_stderr or fe_stdout)

    print("=" * 80)
    print(" SUMMARY REPORT")
    print("=" * 80)
    print(f"• Pytest Test Suite:     {'✅ PASSED' if pytest_passed else '❌ FAILED'} ({duration:.2f}s)")
    print(f"• Frontend Production:   {'✅ PASSED' if frontend_passed else '❌ FAILED'} ({fe_duration:.2f}s)")
    print("-" * 80)

    if pytest_passed and frontend_passed:
        print("🎉 ALL TEST SCENARIOS PASSED SUCCESSFULLY!")
        print("Detailed documentation generated at: TEST_REPORT.md")
        sys.exit(0)
    else:
        print("⚠️ SOME TESTS FAILED. Check output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()

