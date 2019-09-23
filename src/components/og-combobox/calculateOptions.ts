/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

export function calculateOptions(
  listHeight: number,
  maxHeight: number,
  initialTop: number
) {
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - initialTop;

  /**
   * If nothing special happens, this will be our result
   */
  let options = {
    height: listHeight,
    top: initialTop,
  };

  /**
   * If maxHeight is set, we check if the List is longer. If so we set the
   * Optionslist Height to maxHeight. Otherwise Optionslist Height will be
   * definded by the initial listHeight.
   */
   if (!!maxHeight && listHeight > maxHeight) {
    options.height = maxHeight;
  }

  /**
  * Then, if the Optionslist Height is larger the the space below the Select
  * Button we reposition the List.
  */
  if (options.height > spaceBelow) {
    options.top = initialTop - (options.height - spaceBelow);
  }

  /**
   * And if it's even larger the the available window space we adjust it to
   * window sizes.
   */

  if (options.height > windowHeight) {
    options.height = windowHeight;
    options.top = 0;
  }

  return options;
}
