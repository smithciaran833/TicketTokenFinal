#!/bin/bash

echo "🔒 Security Audit for Ticket Core Program"
echo "========================================"

ISSUES=0

# Function to report issues
report_issue() {
    echo "❌ ISSUE: $1"
    ((ISSUES++))
}

# Function to report success
report_ok() {
    echo "✅ OK: $1"
}

# 1. Check for proper signer validation
echo -e "\n1. SIGNER VALIDATION"
for file in programs/ticket-core/src/instructions/*.rs; do
    if grep -q "Signer" "$file"; then
        if ! grep -q "constraint.*key()" "$file"; then
            report_issue "$(basename $file): Signer without key() constraint check"
        else
            report_ok "$(basename $file): Signer validation present"
        fi
    fi
done

# 2. Check for owner validation in transfer operations
echo -e "\n2. OWNERSHIP CHECKS"
if grep -q "ticket.owner == from.key()" programs/ticket-core/src/instructions/transfer_ticket.rs; then
    report_ok "transfer_ticket.rs: Owner validation present"
else
    report_issue "transfer_ticket.rs: Missing owner validation"
fi

# 3. Check for proper PDA validation
echo -e "\n3. PDA VALIDATION"
PDA_COUNT=$(grep -r "seeds = \[" programs/ticket-core/src/instructions/ | wc -l)
BUMP_COUNT=$(grep -r "bump" programs/ticket-core/src/instructions/ | wc -l)
echo "Found $PDA_COUNT PDA definitions and $BUMP_COUNT bump references"

# 4. Check for arithmetic operations
echo -e "\n4. ARITHMETIC SAFETY"
if grep -r "\+\s*1\|+=\s*1\|-\s*1\|-=\s*1" programs/ticket-core/src/instructions/ | grep -v "checked"; then
    report_issue "Unchecked arithmetic operations found"
else
    report_ok "No unsafe arithmetic detected"
fi

# 5. Check for infinite loops
echo -e "\n5. LOOP SAFETY"
LOOP_COUNT=$(grep -r "loop\s*{" programs/ticket-core/src/ | wc -l)
FOR_COUNT=$(grep -r "for.*in" programs/ticket-core/src/ | wc -l)
WHILE_COUNT=$(grep -r "while.*{" programs/ticket-core/src/ | wc -l)

if [ $LOOP_COUNT -gt 0 ]; then
    report_issue "Found $LOOP_COUNT infinite loop(s)"
else
    report_ok "No infinite loops found"
fi

if [ $FOR_COUNT -gt 0 ] || [ $WHILE_COUNT -gt 0 ]; then
    echo "⚠️  WARNING: Found $FOR_COUNT for loops and $WHILE_COUNT while loops - verify they are bounded"
fi

# 6. Check batch operation limits
echo -e "\n6. BATCH LIMITS"
if grep -q "quantity > 100" programs/ticket-core/src/instructions/batch_mint.rs; then
    report_ok "batch_mint.rs: Has quantity limit (100)"
else
    report_issue "batch_mint.rs: Missing quantity limit"
fi

# 7. Check for reentrancy protection
echo -e "\n7. REENTRANCY PROTECTION"
echo "Checking state updates before external calls..."
# This is more complex to check automatically, so we note it for manual review
echo "⚠️  MANUAL REVIEW NEEDED: Verify state updates happen before transfers"

# 8. Check error messages
echo -e "\n8. ERROR HANDLING"
ERROR_COUNT=$(grep -r "Error::" programs/ticket-core/src/errors.rs | wc -l)
echo "Found $ERROR_COUNT custom error types"

# 9. Check for authority validations
echo -e "\n9. AUTHORITY CHECKS"
for file in programs/ticket-core/src/instructions/*.rs; do
    filename=$(basename "$file")
    case $filename in
        "update_event.rs"|"cancel_event.rs"|"reserve_tickets.rs")
            if grep -q "constraint.*authority\|constraint.*organizer" "$file"; then
                report_ok "$filename: Has authority check"
            else
                report_issue "$filename: Missing authority check"
            fi
            ;;
    esac
done

# 10. Check for DOS vectors in validation
echo -e "\n10. DOS PREVENTION"
if grep -q "Vec<" programs/ticket-core/src/state.rs; then
    echo "⚠️  WARNING: Dynamic vectors found in state - ensure they have practical limits"
fi

# Summary
echo -e "\n========================================"
if [ $ISSUES -eq 0 ]; then
    echo "🎉 SECURITY AUDIT PASSED - No critical issues found!"
else
    echo "⚠️  FOUND $ISSUES SECURITY ISSUES - Please review above"
fi
echo "========================================"

# Additional recommendations
echo -e "\nRECOMMENDATIONS:"
echo "1. Run 'cargo audit' to check dependencies"
echo "2. Use 'solana-security-txt' to add security contact"
echo "3. Consider formal audit before mainnet"
echo "4. Test with fuzzing tools"
echo "5. Set up monitoring for suspicious transactions"
