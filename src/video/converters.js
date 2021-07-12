import { first } from 'ckeditor5/src/utils';
import { getViewVideoFromWidget } from './utils';


export function viewFigureToModel(videoUtils) {
	return dispatcher => {
		dispatcher.on( 'element:figure', converter );
	};

	function converter( evt, data, conversionApi ) {
		// Do not convert if this is not an "video figure".
		if ( !conversionApi.consumable.test( data.viewItem, { name: true, classes: 'video' } ) ) {
			return;
		}

		// Find an video element inside the figure element.
		const viewVideo = videoUtils.getViewVideoFromWidget( data.viewItem );

		// Do not convert if video element is absent, is missing src attribute or was already converted.
		if (!viewVideo
			|| !viewVideo.hasAttribute( 'src' )
			|| !conversionApi.consumable.test( viewVideo, { name: true } ) ) {
			return;
		}

		// Convert view video to model video.
		const conversionResult = conversionApi.convertItem( viewVideo, data.modelCursor );

		// Get video element from conversion result.
		const modelVideo = first( conversionResult.modelRange.getItems() );

		// When video wasn't successfully converted then finish conversion.
		if ( !modelVideo ) {
			return;
		}

		// Convert rest of the figure element's children as an video children.
		conversionApi.convertChildren( data.viewItem, modelVideo );

		conversionApi.updateConversionResult( modelVideo, data );
	}
}

export function modelToViewAttributeConverter( videoUtils, videoType, attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:${videoType}`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const video = videoUtils.getViewVideoFromWidget( element );

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', video );
	}
}
