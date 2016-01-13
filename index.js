var _ = require( 'underscore' ),
		fs = require( 'fs' ),
		async = require( 'async' ),
		csvParser = require( 'csvparse2objects' );

module.exports = function( options, cb ) {
	return getParsedCSV( options.lookupCSV, gotParsedCSV );

	function gotParsedCSV( err, results ) {
		generateByKeyIndexes( results );

		return async.eachSeries( options.filesToTransform, transformFile, done );

		function transformFile( filename, cb ) {
			return async.waterfall( [
				_.partial( fs.readFile, filename, 'utf8' ),
				csvParser,
				generateByKeyIndexes,
				addDataToRecords,
				makeUpdatedCsv,
				writeOutput
			], cb );

			function writeOutput( newCSV, cb ) {
				var split = filename.split( '.' ),
						extension = split.pop();

				split[ split.length - 1 ] += options.outputSuffix;
				
				var newFilename = split.join( '.' );

				fs.writeFile( newFilename, newCSV, cb );
			}
		}

		function generateByKeyIndexes( items, cb ) {
			var byKey = items.byKey = {};

			items.objects.forEach( declareOnByKey );

			return cb && cb( null, items );

			function declareOnByKey( object ) {
				Object.keys( object ).forEach( declarePropertyOnByKey );

				function declarePropertyOnByKey( key ) {
					var value = object[ key ],
							byCurrentKey;

					if( key && value ) {
						byCurrentKey = byKey[ key ] = byKey[ key ] || {};
						byCurrentKey[ value ] = object;
					}
				}
			}
		}

		function addDataToRecords( records, cb ) {
			var itemsByLookupKey = results.byKey[ options.lookupField ],
					localLookupField = options.lookupFieldDest || options.lookupField;
			
			Object.keys( options.extraData ).forEach( addExtraData );

			return cb( null, records );

			function addExtraData( key ) {
				var lookup = options.extraData[ key ];

				records.byKey[ key ] = {};

				records.objects.forEach( addExtraDataToRecord );
				
				function addExtraDataToRecord( record ) {
					var otherRecord = itemsByLookupKey[ record[ localLookupField ] ],
							value = typeof lookup === 'function' ? lookup( otherRecord ) : otherRecord[ lookup ];
					
					record[ key ] = value;

					records.byKey[ key ][ value ] = record;
				}
			}
		}

		function makeUpdatedCsv( records, cb ) {
			var header = Object.keys( records.byKey ),
					newCSV = records.objects.map( createLine );
			
			newCSV.unshift( header.join( records.delimiter ) );

			return cb( null, newCSV.join( '\n' ) );

			function createLine( object ) {
				var line = [];
				
				header.forEach( addValue );

				return line.join( records.delimiter );

				function addValue( key ) {
					line.push( object[ key ] );
				}
			}
		}

		function done( err ) {
			if( cb ) return cb( err );
			console.log( err || 'yay' );
		}
	}
};

function getParsedCSV( filename, cb ) {
	return async.waterfall( [
		_.partial( fs.readFile, filename, 'utf8' ),
		csvParser
	], cb );
}
