from app.rules.terminology import find_terminology_issues
from app.schemas.review import ApprovedTerm


def test_matching_is_case_insensitive_and_avoids_partial_words():
    rules = [ApprovedTerm(preferred="customer", avoid=["consumer"])]
    findings = find_terminology_issues(
        "CONSUMER matters, but consumerism is not the same word.", rules
    )
    assert len(findings) == 1
    assert findings[0].excerpt == "CONSUMER"
    assert findings[0].suggestion == "customer"
