/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

export function positionSelectOptions(
  /** Maeasures of the triggering select element */
  selectDimensions: DOMRect,

  /** Maeasures of the triggered options element */
  optionsMeasures: DOMRect,

  /** OPtional: MaxHeight of the triggered options element */
  maxHeight?: number,
){
  // console.log( 'POSITION selectMeasures:', selectMeasures );
  // console.log( 'POSITION maxHeight:', maxHeight );
  // console.log( 'POSITION optionsMeasures:', optionsMeasures );

  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - (selectDimensions ? selectDimensions.bottom : optionsMeasures.top);

  /**
  * If nothing special happens, this will be our result
  */
  let measures = {
    height: optionsMeasures.height,
    left: selectDimensions.left + selectDimensions.width - optionsMeasures.width,
    top: selectDimensions.bottom,
    width: optionsMeasures.width,
  };

  /**
   * If maxHeight is set, we check if the List is longer. If so we set the
   * Optionslist Height to maxHeight. Otherwise Optionslist Height will be
   * definded by the initial listHeight.
   */
  if (!!maxHeight && measures.height > maxHeight) {
    measures.height = maxHeight;
  }

  /**
  * Then, if the Optionslist Height is larger the the space below the Select
  * Button we reposition the List.
  */
  if (measures.height > spaceBelow) {
    measures.top = selectDimensions.bottom - (measures.height - spaceBelow);
  }

  /**
   * And if it's even larger the the available window space we adjust it to
   * window sizes.
   */

  if (measures.height > windowHeight) {
    measures.height = windowHeight;
    measures.top = 0;
  }

  return measures;
}
