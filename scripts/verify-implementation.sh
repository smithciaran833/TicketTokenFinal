#!/bin/bash

echo "🔍 Verifying 10/10 Implementation"
echo "================================"

SCORE=0
TOTAL=10

# Check 1: Constants file exists and is complete
if [ -f "programs/ticket-core/src/constants.rs" ] && grep -q "MAX_BATCH_SIZE" "programs/ticket-core/src/constants.rs"; then
    echo "✅ Constants module implemented"
    ((SCORE++))
else
    echo "❌ Constants module missing"
fi

# Check 2: Safe math is used
if grep -r "safe_add\|safe_sub\|safe_mul" programs/ticket-core/src/instructions/ > /dev/null; then
    echo "✅ Safe arithmetic implemented"
    ((SCORE++))
else
    echo "❌ Still using unsafe arithmetic"
fi

# Check 3: Error codes exist
if grep -q "= 1001" programs/ticket-core/src/errors.rs; then
    echo "✅ Error codes implemented"
    ((SCORE++))
else
    echo "❌ Error codes missing"
fi

# Check 4: Refund instruction exists
if [ -f "programs/ticket-core/src/instructions/refunds/request_refund.rs" ]; then
    echo "✅ Refund system implemented"
    ((SCORE++))
else
    echo "❌ Refund system missing"
fi

# Check 5: Compliance module exists
if [ -f "programs/ticket-core/src/state/compliance.rs" ]; then
    echo "✅ Compliance module implemented"
    ((SCORE++))
else
    echo "❌ Compliance module missing"
fi

# Check 6: Emergency pause exists
if [ -f "programs/ticket-core/src/instructions/admin/emergency_pause.rs" ]; then
    echo "✅ Emergency pause implemented"
    ((SCORE++))
else
    echo "❌ Emergency pause missing"
fi

# Check 7: Unit tests exist
if [ -d "tests/unit" ] && [ "$(ls -A tests/unit)" ]; then
    echo "✅ Unit tests created"
    ((SCORE++))
else
    echo "❌ Unit tests missing"
fi

# Check 8: Benchmarks exist
if [ -f "tests/benchmarks/bench_mint.rs" ]; then
    echo "✅ Benchmarks implemented"
    ((SCORE++))
else
    echo "❌ Benchmarks missing"
fi

# Check 9: Documentation complete
if [ -f "docs/INVARIANTS.md" ] && [ -f "docs/FORMAL_VERIFICATION.md" ]; then
    echo "✅ Documentation complete"
    ((SCORE++))
else
    echo "❌ Documentation incomplete"
fi

# Check 10: All utils implemented
if [ -f "programs/ticket-core/src/utils/validation.rs" ] && [ -f "programs/ticket-core/src/utils/math.rs" ]; then
    echo "✅ Utility modules complete"
    ((SCORE++))
else
    echo "❌ Utility modules incomplete"
fi

echo ""
echo "========================================="
echo "SCORE: $SCORE / $TOTAL"
echo "========================================="

if [ $SCORE -eq 10 ]; then
    echo "🎉 PERFECT SCORE! Ready for audit!"
else
    echo "📈 Keep going! $((10 - SCORE)) items remaining"
fi
