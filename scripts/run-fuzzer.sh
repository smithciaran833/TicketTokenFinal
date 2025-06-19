#!/bin/bash
echo "🔍 Running fuzzer..."
cd tests/fuzzing
cargo +nightly fuzz run fuzz_mint -- -max_total_time=300
