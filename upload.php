<?php
if ($_FILES["newTileSVG"]["error"] > 0) {
	$response = Array("status" => "ERROR", "message" => $_FILES["newTileSVG"]["error"]);
} else {
	$tileCoordsArray = explode(',', $_POST['tileCoords']);

	$tileCoords['x'] = str_replace('-','n', $tileCoordsArray[0]);
	$tileCoords['y'] = str_replace('-','n', $tileCoordsArray[1]);
	
	$newTileSVG = $_FILES["newTileSVG"]["tmp_name"];
	$im = new Imagick();
	$svg = file_get_contents($newTileSVG);

	$im->readImageBlob($svg);

	/* png settings */
	$im->setImageFormat("png24");
	$im->resizeImage(240, 240, imagick::FILTER_LANCZOS, 1);

	$im->writeImage('img/tiles/' . $tileCoords['x'] . '-' . $tileCoords['y'] . '.png');
	$im->clear();
	$im->destroy();
	
	move_uploaded_file($_FILES["newTileSVG"]["tmp_name"], 'img/tiles/' . $tileCoords['x'] . '-' . $tileCoords['y'] . '.svg');
	
	$response = Array("status" => "SUCCESS", "message" => "", "tileCoords" => $tileCoords['x'] . '-' . $tileCoords['y']);
}

echo json_encode($response);
?>