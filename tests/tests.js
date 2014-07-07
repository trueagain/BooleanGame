QUnit.test("toNDigitsString test", function(assert) {
    assert.ok(toNDigitsString(3, 3) == "003");
    assert.ok(toNDigitsString(24, 4) == "0024");
    assert.ok(toNDigitsString(5, 1) == "5");
}); 