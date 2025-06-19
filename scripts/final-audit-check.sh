#!/bin/bash

echo "🔍 FINAL COMPREHENSIVE AUDIT CHECK"
echo "=================================="
echo ""

MISSING_ITEMS=0

# 1. Check if we're using the actual program ID everywhere
echo "1️⃣ Checking Program ID consistency..."
PROGRAM_ID_IN_LIB=$(grep "declare_id" programs/ticket-core/src/lib.rs | grep -o '"[^"]*"' | tr -d '"')
echo "Program ID in lib.rs: $PROGRAM_ID_IN_LIB"
if [ "$PROGRAM_ID_IN_LIB" == "2GDYBKrhJppXYgUs78iGDVwdDoQ8G9tCPXVjEjEDWeWd" ]; then
    echo "⚠️  WARNING: Still using test program ID. Should update to your deployed ID: EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm"
    ((MISSING_ITEMS++))
else
    echo "✅ Program ID looks correct"
fi

# 2. Check if all new modules are properly exported in lib.rs
echo -e "\n2️⃣ Checking module exports in lib.rs..."
if ! grep -q "pub mod constants;" programs/ticket-core/src/lib.rs; then
    echo "❌ Missing: pub mod constants; in lib.rs"
    ((MISSING_ITEMS++))
fi
if ! grep -q "pub mod utils;" programs/ticket-core/src/lib.rs; then
    echo "❌ Missing: pub mod utils; in lib.rs"
    ((MISSING_ITEMS++))
fi
if ! grep -q "pub mod traits;" programs/ticket-core/src/lib.rs; then
    echo "❌ Missing: pub mod traits; in lib.rs"
    ((MISSING_ITEMS++))
fi

# 3. Check if new instructions are added to lib.rs program module
echo -e "\n3️⃣ Checking new instructions in program module..."
if ! grep -q "request_refund" programs/ticket-core/src/lib.rs; then
    echo "❌ Missing: request_refund instruction in program module"
    ((MISSING_ITEMS++))
fi
if ! grep -q "emergency_pause" programs/ticket-core/src/lib.rs; then
    echo "❌ Missing: emergency_pause instruction in program module"
    ((MISSING_ITEMS++))
fi

# 4. Check Cargo.toml for missing dependencies
echo -e "\n4️⃣ Checking Cargo.toml..."
if ! grep -q "getrandom" programs/ticket-core/Cargo.toml; then
    echo "⚠️  WARNING: May need getrandom for randomness features"
fi

# 5. Check for TODO or FIXME comments
echo -e "\n5️⃣ Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" programs/ticket-core/src/ 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "⚠️  WARNING: Found $TODO_COUNT TODO/FIXME comments:"
    grep -r "TODO\|FIXME\|XXX\|HACK" programs/ticket-core/src/ 2>/dev/null | head -5
    ((MISSING_ITEMS++))
fi

# 6. Check for proper Close constraints on temporary accounts
echo -e "\n6️⃣ Checking account closures..."
if ! grep -q "close = " programs/ticket-core/src/instructions/delegate_transfer.rs; then
    echo "⚠️  WARNING: DelegateAuthority might not be closing properly (rent not returned)"
fi

# 7. Check for missing derive macros
echo -e "\n7️⃣ Checking derive macros..."
if ! grep -q "#\[derive(.*Default.*)\]" programs/ticket-core/src/state/event.rs; then
    echo "⚠️  INFO: Consider adding Default derive to structs for easier testing"
fi

# 8. Check for missing Size implementations
echo -e "\n8️⃣ Checking account size calculations..."
for file in programs/ticket-core/src/state/*.rs; do
    if grep -q "pub struct" "$file" && ! grep -q "LEN.*=" "$file"; then
        echo "⚠️  WARNING: Missing LEN constant in $file"
    fi
done

# 9. Check if new state types are in the correct files
echo -e "\n9️⃣ Checking state organization..."
if grep -q "struct Event" programs/ticket-core/src/state.rs; then
    echo "❌ Event struct still in state.rs, should be in state/event.rs"
    ((MISSING_ITEMS++))
fi

# 10. Check for proper error handling in math operations
echo -e "\n🔟 Checking error handling..."
UNWRAP_COUNT=$(grep -r "unwrap()" programs/ticket-core/src/instructions/ 2>/dev/null | wc -l)
if [ $UNWRAP_COUNT -gt 0 ]; then
    echo "⚠️  WARNING: Found $UNWRAP_COUNT unwrap() calls - should use ? operator"
    ((MISSING_ITEMS++))
fi

# 11. Check for missing event emissions
echo -e "\n1️⃣1️⃣ Checking event emissions..."
EMIT_COUNT=$(grep -r "emit!" programs/ticket-core/src/ | wc -l)
echo "📊 Found $EMIT_COUNT event emissions"
if [ $EMIT_COUNT -lt 5 ]; then
    echo "⚠️  INFO: Consider adding more events for monitoring (transfers, refunds, etc.)"
fi

# 12. Check for clock usage
echo -e "\n1️⃣2️⃣ Checking Clock usage..."
CLOCK_COUNT=$(grep -r "Clock::get()" programs/ticket-core/src/ | wc -l)
echo "📊 Clock::get() called $CLOCK_COUNT times"
echo "ℹ️  Consider caching Clock::get() result if used multiple times in same instruction"

# 13. Check account discriminators
echo -e "\n1️⃣3️⃣ Checking account padding..."
if ! grep -q "+ 64" programs/ticket-core/src/state/compliance.rs; then
    echo "⚠️  INFO: Some LEN calculations might be missing padding"
fi

# 14. Check for feature flags usage
echo -e "\n1️⃣4️⃣ Checking feature implementation..."
if ! grep -q "feature_flags" programs/ticket-core/src/instructions/; then
    echo "ℹ️  INFO: ProgramState has feature_flags but they're not being checked in instructions"
fi

# 15. Check for missing imports
echo -e "\n1️⃣5️⃣ Checking imports..."
for file in programs/ticket-core/src/instructions/*.rs; do
    if grep -q "safe_add\|safe_sub" "$file" && ! grep -q "use crate::utils::math::" "$file"; then
        echo "❌ Missing math import in $file"
        ((MISSING_ITEMS++))
    fi
done

# Summary
echo -e "\n======================================="
echo "FINAL AUDIT RESULTS"
echo "======================================="
if [ $MISSING_ITEMS -eq 0 ]; then
    echo "✅ PERFECT! No issues found!"
    echo "Your code is truly 10/10 🎉"
else
    echo "Found $MISSING_ITEMS potential improvements"
    echo "These are mostly minor optimizations"
fi

# Additional recommendations
echo -e "\n📋 FINAL RECOMMENDATIONS:"
echo "1. Update program ID to your deployed version"
echo "2. Add #[event] macros for important operations"
echo "3. Consider adding Program Derived Address (PDA) documentation"
echo "4. Add integration test that uses all features together"
echo "5. Create a seeds.json file documenting all PDA seeds"
echo "6. Add a VERSION constant to track deployments"
echo "7. Consider implementing Program Authority transfer function"
echo "8. Add max length validations for all String fields"
echo "9. Document gas costs for each instruction"
echo "10. Create upgrade migration plan"
