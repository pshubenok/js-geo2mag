function Matrix(ary) {
    this.mtx = ary;
    this.height = ary.length;
    this.width = ary[0].length;
}

Matrix.prototype.toString = function () {
    var s = [];
    for (var i = 0; i < this.mtx.length; i++)
        s.push(this.mtx[i].join(","));
    return s.join("\n");
};

// returns a new matrix
Matrix.prototype.transpose = function () {
    var transposed = [];
    for (var i = 0; i < this.width; i++) {
        transposed[i] = [];
        for (var j = 0; j < this.height; j++) {
            transposed[i][j] = this.mtx[j][i];
        }
    }
    return new Matrix(transposed);
};

Matrix.prototype.mult = function (other) {
    if (this.width != other.height) {
        throw "error: incompatible sizes";
    }

    var result = [];
    for (var i = 0; i < this.height; i++) {
        result[i] = [];
        for (var j = 0; j < other.width; j++) {
            var sum = 0;
            for (var k = 0; k < this.width; k++) {
                sum += this.mtx[i][k] * other.mtx[k][j];
            }
            result[i][j] = sum;
        }
    }
    return new Matrix(result);
};

function geo2mag(lat, lon) {
    lon = ((lon + 360.0) % 360.0);

    var Dlong = 288.59 * (Math.PI / 180); //longitude (in degrees) of Earth's magnetic south pole
    var Dlat = 79.30 * (Math.PI / 180); //latitude (in degrees) of same (1995)
    var R = 1;


    var glat = lat * (Math.PI / 180);
    var glon = lon * (Math.PI / 180);
    var galt = R;

    var coord = [glat, glon, galt];

    var x = coord[2] * Math.cos(coord[0]) * Math.cos(coord[1]);
    var y = coord[2] * Math.cos(coord[0]) * Math.sin(coord[1]);
    var z = coord[2] * Math.sin(coord[0]);

    var geolong2maglong = [];
    geolong2maglong[0] = [0, 0, 0];
    geolong2maglong[0][0] = Math.cos(Dlong);
    geolong2maglong[0][1] = Math.sin(Dlong);
    geolong2maglong[1] = [0, 0, 0];
    geolong2maglong[1][0] = -Math.sin(Dlong);
    geolong2maglong[1][1] = Math.cos(Dlong);
    geolong2maglong[2] = [0, 0, 0];
    geolong2maglong[2][2] = 1;
    var out = (new Matrix(geolong2maglong)).mult(new Matrix([
        [x],
        [y],
        [z]
    ]));

    var tomaglat = [];
    tomaglat[0] = [0, 0, 0];
    tomaglat[1] = [0, 0, 0];
    tomaglat[2] = [0, 0, 0];
    tomaglat[0][0] = Math.cos(Math.PI / 2 - Dlat);
    tomaglat[0][2] = -Math.sin(Math.PI / 2 - Dlat);
    tomaglat[2][0] = Math.sin(Math.PI / 2 - Dlat);
    tomaglat[2][2] = Math.cos(Math.PI / 2 - Dlat);
    tomaglat[1][1] = 1;
    out = (new Matrix(tomaglat)).mult(out);

    var mlat = Math.atan2(out.mtx[2], Math.sqrt(Math.pow(out.mtx[0], 2) + Math.pow(out.mtx[1], 2)));
    mlat = mlat * 180 / Math.PI;
    var mlon = Math.atan2(out.mtx[1], out.mtx[0]);
    mlon = mlon * 180 / Math.PI;

    return {
        mlat: mlat,
        mlon: mlon
    };
};