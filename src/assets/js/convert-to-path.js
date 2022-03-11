export function convertCE(cx, cy) {
    function calcOuput(cx, cy, rx, ry) {
        if (cx < 0 || cy < 0 || rx <= 0 || ry <= 0) {
            return '';
        }

        let output = 'M' + (cx - rx).toString() + ',' + cy.toString();
        output += 'a' + rx.toString() + ',' + ry.toString() + ' 0 1,0 ' + (2 * rx).toString() + ',0';
        output += 'a' + rx.toString() + ',' + ry.toString() + ' 0 1,0'  + (-2 * rx).toString() + ',0';

        return output;
    }

    switch (arguments.length) {
    case 3:
        return calcOuput(parseFloat(cx, 10), parseFloat(cy, 10), parseFloat(arguments[2], 10), parseFloat(arguments[2], 10));
    case 4:
        return calcOuput(parseFloat(cx, 10), parseFloat(cy, 10), parseFloat(arguments[2], 10), parseFloat(arguments[3], 10));
    default:
        return '';
    }
}

/** pass the value of the attribute `points` into this function */
export function convertPoly(points, types) {
    types = types || 'polyline';

    let pointsArr = points
        /** clear redundant characters */
        .split('     ').join('')
        .trim()
        .split(/\s+|,/);
    let x0 = pointsArr.shift();
    let y0 = pointsArr.shift();

    let output = 'M' + x0 + ',' + y0 + 'L' + pointsArr.join(' ');

    return types === 'polygon' ? output + 'z' : output;
}

export function convertLine(x1, y1, x2, y2) {
    if (parseFloat(x1, 10) < 0 || parseFloat(y1, 10) < 0 || parseFloat(x2, 10) < 0 || parseFloat(y2, 10) < 0) {
        return '';
    }

    return 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2;
}

export function convertRectangles(x, y, width, height) {
    x = parseFloat(x, 10);
    y = parseFloat(y, 10);
    width = parseFloat(width, 10);
    height = parseFloat(height, 10);

    if (x < 0 || y < 0 || width < 0 || height < 0) {
        return '';
    }

    return 'M' + x + ',' + y + 'L' + (x + width) + ',' + y + ' ' + (x + width) + ',' + (y + height) + ' ' + x + ',' + (y + height) + 'z';
}
