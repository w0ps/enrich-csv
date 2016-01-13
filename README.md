# enrich-csv
adds extra columns to a csv file from another csv file

usage:

```javascript
var enrichCSV = require( 'enrich-csv' ),
    options = {
    	lookupCSV: 'path/to/file/containing/data/you/want/to/insert.csv', // the 'source' file
    	filesToTransform: [ 'other/file/that/needs/extra/data.csv' ], // the 'dest' file(s)
    	outputSuffix: '-modified', // suffix that gets added to output filename
    	lookupField: 'id', // uses this field from 'source' file for looking up
    	//lookupFieldDest: 'id', // uses this field from 'dest' file for looking up. optional.
    	extraData: { // the data to add to the 'dest' file(s)
    		//name: 'last name'//, // when you pass a string it takes the value from that column
    		name: function( record ){
    			//console.log( record );
    			return ( record[ 'first name' ] + ' ' + record.infix + ' ' + record[ 'last name' ] ).replace( '  ', ' ' );
    		}, // when you pass an object you get the whole row as an object and decide for yourself what you return
    	}
    },
    callback = console.log.bind( console, 'done enriching' );


enrichCSV( options, callback );

```
