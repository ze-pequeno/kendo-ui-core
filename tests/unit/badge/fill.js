import '@progress/kendo-ui/src/kendo.badge.js';

let Badge = kendo.ui.Badge;
let span;
let badge;

describe('kendo.ui.Badge fillMode', function() {
    beforeEach(function() {
        span = $('<span />').appendTo(Mocha.fixture);
    });
    afterEach(function() {
        badge.destroy();
        span.remove();
        kendo.destroy(Mocha.fixture);
    });

    // #region badge.options.fillMode
    it('badge.options.fillMode sets correct classNames', function() {
        badge = new Badge(span, { fillMode: 'outline' });

        assert.equal(badge._fillMode, 'outline');
        assert.equal(badge.element.hasClass('k-badge-outline'), true);
    });
    it('badge.options.fillMode does not set classNames if fillMode is \'\'', function() {
        badge = new Badge(span, { fillMode: '' });

        assert.equal(badge._fillMode, '');
        assert.equal(badge.element.hasClass('k-badge-'), false);
    });
    // #endregion


    // #region setOptions
    it('badge.setOptions(fillMode) sets correct classNames', function() {
        badge = new Badge(span, { fillMode: 'flat' });

        badge.setOptions({ fillMode: 'outline' });

        assert.equal(badge._fillMode, 'outline');
        assert.equal(badge.element.hasClass('k-badge-flat'), false);
        assert.equal(badge.element.hasClass('k-badge-outline'), true);
    });
    it('badge.setOptions(fillMode) does not set classNames if fillMode is \'\'', function() {
        badge = new Badge(span, { fillMode: 'flat' });

        badge.setOptions({ fillMode: '' });

        assert.equal(badge._fillMode, '');
        assert.equal(badge.element.hasClass('k-badge-flat'), false);
        assert.equal(badge.element.hasClass('k-badge-'), false);
    });
    // #endregion

});
