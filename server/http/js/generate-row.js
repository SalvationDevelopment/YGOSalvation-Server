// generate-row.js
$(function () {
    var generateRows = $('.generateRow'),
        output = "",
		temp,
		tempX,
		tempY,
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
        amountY = tempY = parseInt((temp.attr('data-amount-y') || defaults.amountY), 10);
        amountX = tempX = parseInt((temp.attr('data-amount-x')  || defaults.amountX), 10);
        dataWidth = temp.attr('data-width') || defaults.dataWidth;
        dataHeight = temp.attr('data-height') || defaults.dataHeight;
		while(--tempY >= 0) {
			output += '<span class="generateOutput_Y cardRow_' + tempY + '" style="height: ' + dataHeight + ';">';
			while (--tempX >= 0) {
                output += '<span class="generatedRow cardCol_' + tempX + '" style="width: ' + dataWidth + '; height: ' + dataHeight + '; margin: 2px 2px 2px 2px; padding: 1px 1px 1px 1px;"></span>';
            }
			tempX = amountX;
			output += '</span>';
		}
		tempY = amountY;
		temp.replaceWith(output);
    }
});