jQuery(document).ready(function() {
	var startingX, startingY, startingPoint, hashArray, centerTileScreenCoords, DOODLEFORGOOD;
	
	startingX = 0;
	startingY = 0;
	
	if (window.location.hash && window.location.hash.split('-').length > 1) {
		hashArray = window.location.hash.replace('#','').split('-');
		
		startingX = hashArray[0].replace('n', '-');
		startingY = hashArray[1].replace('n', '-');
	}
	
	startingPoint = { x: Number(startingX), y: Number(startingY) };
	
	DOODLEFORGOOD = {
		/* SETTINGS */
		preferredTilesWide: 10,
		tileSizeMin: 120,
		tileSizeMax: 240,
		tileBuffer: 1,

		/* METHODS */
		// Returns size of tile in pixels
		getTileSize: function() {
			if (this.tileSize) { return this.tileSize; }
			
			var self = this,
				size = 0, 
				tmp = 0;
			/* Determine grid size and location */
			// Rules:
			// Tiles are square
			// If tile size is less than preferred tile size min, force preferred tile size min
			// If tile size is greater than preferred tile size max, force preferred tile size max
			tmp = jQuery(window).width()/self.preferredTilesWide;
			
			if (tmp >= self.tileSizeMin && tmp <= self.tileSizeMax) { self.tileSize = tmp;} 
			else if (tmp < self.tileSizeMin) { self.tileSize = self.tileSizeMin; } 
			else if (tmp > self.tileSizeMax) { self.tileSize = self.tileSizeMax; }
			
			return this.tileSize;
		},
		
		// Returns an object of what the initial starting grid should look like
		getGrid: function() {
			if (this.grid) { return this.grid; }
			
			var self = this,
				windowSize = {
					width: jQuery(window).width(),
					height: jQuery(window).height()
				},
				gridCols = Math.floor((windowSize.width / self.getTileSize()) + (self.tileBuffer*2)),
				gridRows = Math.floor((windowSize.height / self.getTileSize()) + (self.tileBuffer*2)),
				gridWidth,
				gridHeight;

			// Force an odd number of rows and columns
			if (gridCols % 2 === 0) { gridCols += 1; }
			if (gridRows % 2 === 0) { gridRows += 1; }
			
			gridWidth = gridCols * self.getTileSize(); 
			gridHeight = gridRows * self.getTileSize();

			/* Determine size and positioning of container grid which holds all images */
			// Rules:
			// 	Grid should hold the number of tiles that can fit on the screen plus 
			// 	self.tileBuffer images past the edge on all sides

			this.grid = {
				width: gridWidth,
				height: gridHeight,
				top: -Math.floor((gridHeight - jQuery(window).height()) / 2),
				left: -Math.floor(((gridWidth - jQuery(window).width()) / 2)),
				cols: gridCols,
				rows: gridRows,
				area: gridCols * gridRows
			};

			return this.grid;
		},
		
		// Positions the wall that will contain the tiles. It has no width or height, it merely sets the initial center point
		positionCenter: function() {
			var self = this;
			
			// Setting wall 
			jQuery('#the-wall').css({
				'left': jQuery(window).width()/2,
				'top': jQuery(window).height()/2,
				'width': '0',
				'height': '0',
				'overflow': 'visible'				
			});
		},
		
		createTile: function(x, y) {
			var self = this, tileContainer;
			
			// Check to see if this tile already exists. If so, skip creation of it.
			if (jQuery('#' + (String(x).replace('-','n') + '-' + String(y).replace('-','n'))).length) { return; }
			
			// Create tile html node
			tileContainer = jQuery('<div/>', {
				'class': 'tile',
				'data-x': x,
				'data-y': y,
				'id': (String(x).replace('-','n') + '-' + String(y).replace('-','n'))
			})
			.css({
				'position': 'absolute',
				'left': (x - startingPoint.x)*self.getTileSize()-(self.getTileSize()/2),
				'top': -(y - startingPoint.y)*self.getTileSize()-(self.getTileSize()/2),
				'width': self.getTileSize(),
				'height': self.getTileSize()
			})
			.appendTo('#the-wall')
			.mouseup(self.tileClick);
			
			jQuery('<img/>', {
				'src': 'img/tiles/' + (String(x).replace('-','n') + '-' + String(y).replace('-','n')) + '.png'
			})
			.css('display','none')
			.appendTo(tileContainer)
			.load(function() {
				jQuery(this).fadeIn('fast');
			});
		},
		
		// Builds all the tiles necessary to keep the view filled
		buildTiles: function(centerPoint) {
			var self = this,
				xHalf = Math.floor(self.getGrid().cols/2),
				yHalf = Math.floor(self.getGrid().rows/2);
				
			// Loop through every tile
			for (var x = centerPoint.x - xHalf; x <= centerPoint.x + xHalf; x++) {
				for (var y = centerPoint.y + yHalf; y >= centerPoint.y - yHalf; y--) {
					self.createTile(x, y);
				}
			}
			
			// Set "screen" coordinates of center tile for tracking wall movement
			if (!centerTileScreenCoords) {
				centerTileScreenCoords = {
					x: Math.floor(jQuery('#' + (String(startingPoint.x).replace('-','n') + '-' + String(startingPoint.y).replace('-','n'))).offset().left/self.getTileSize()),
					y: Math.floor(jQuery('#' + (String(startingPoint.x).replace('-','n') + '-' + String(startingPoint.y).replace('-','n'))).offset().top/self.getTileSize())
				}
			}
		},
		
		tileClick: function(thisTile) {
			if (jQuery('#the-wall').is('.ui-draggable-dragging')) { return; }
			
			var x = jQuery(this).attr('data-x'), 
				y = jQuery(this).attr('data-y');
			
			
			// Fade out the wall
			jQuery('#the-wall').fadeOut('slow', function() {
				var fullScreenSize = jQuery(window).width() > jQuery(window).height() ? jQuery(window).height() : jQuery(window).width();
				
				// Create SVG image node and display full screen
				jQuery('<img/>', {
					'src': 'img/tiles/' + (String(x).replace('-','n') + '-' + String(y).replace('-','n')) + '.svg'
				})
				.css({
					'position': 'fixed',
					'top': (jQuery(window).height()-fullScreenSize)/2,
					'left': (jQuery(window).width()-fullScreenSize)/2,
					'height': fullScreenSize,
					'width': fullScreenSize,
					'display': 'none',
					'z-index': '100'
				})
				.prependTo('body')
				.load(function() {
					jQuery(this).fadeIn('fast');
				})
				.click(function() {
					var thisTile = this;
					
					jQuery(thisTile).fadeOut('fast', function() {
						jQuery(thisTile).remove();
						jQuery('#the-wall').fadeIn('fast');
					});
				});	
			});
		},
		
		wallDrag: function(event) {
			var self = this, // this = Draggable, not DOODLEFORGOOD
				offset = jQuery('#' + (String(startingPoint.x).replace('-','n') + '-' + String(startingPoint.y).replace('-','n'))).offset(),
				tilesX = -(Math.floor(offset.left/DOODLEFORGOOD.getTileSize()) - centerTileScreenCoords.x),
				tilesY = Math.floor(offset.top/DOODLEFORGOOD.getTileSize()) - centerTileScreenCoords.y;

			DOODLEFORGOOD.buildTiles({x:startingPoint.x + tilesX, y: startingPoint.y + tilesY });
		}
	};
	
	// Make the wall draggable
	jQuery( "#the-wall" ).draggable({
		drag: DOODLEFORGOOD.wallDrag
	});	
	
	// Set the wall to the center of the screen
	DOODLEFORGOOD.positionCenter();
	
	// Build tiles around the wall to get started
	DOODLEFORGOOD.buildTiles(startingPoint);
	
	// Setup upload dialog box
	jQuery("#image-upload").click(function() {
		jQuery("#image-upload-dialog").dialog({
			width: 400,
			height: 200
		});
	});
	
	jQuery("#image-upload-form").ajaxForm(function(responseText) {
		var responseObject = JSON.parse(responseText);
		
		if (responseObject && responseObject.status === "ERROR") {
			alert('An error has occured');
		} else if (responseObject.status === "SUCCESS") {
			console.log(jQuery('#' + responseObject.tileCoords));
			jQuery('#' + responseObject.tileCoords + ' img')
				.attr('src', 'img/tiles/' + responseObject.tileCoords + '.png?no-cache=' + (Math.floor(Math.random()*10000000)));
		}
	});
});