// generate-row.js
$(function () {
    var generateRows = $('.generateRow'),
        output = "",
		temp,
        amountY,
        amountX,
        dataWidth,
        dataHeight,
        defaults = {
            amountX: 15,
            amountY: 1,
            dataWidth: "44px",
            dataHeight: "64px"
        };
    for (var i = 0, len = generateRows.length; i < len; i++) {
		temp = $(generateRows[i]);
        amountY = parseInt(temp.attr('data-amount-y'), 10) || defaults.amountY;
        amountX = parseInt(temp.attr('data-amount-x'), 10) || defaults.amountX;
        dataWidth = temp.attr('data-width') || defaults.dataWidth;
        dataHeight = temp.attr('data-height') || defaults.dataHeight;
		while(--amountY >= 0) {
			output += '<span class="generateOutput_Y cardRow_' + amountY + '" style="height: ' + dataHeight + ';">';
			while (--amountX >= 0) {
                output += '<span class="generatedRow cardCol_' + amountX + '" style="width: ' + dataWidth + '; height: ' + dataHeight + '; margin: 2px 2px 2px 2px; padding: 1px 1px 1px 1px;"></span>';
            }
			output += '</span>';
		}
		temp.replaceWith(output);
    }
});