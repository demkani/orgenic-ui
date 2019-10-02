/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { Component, h } from '@stencil/core';

@Component({
  tag: 'og-card-footer',
  styleUrl: 'og-card-footer.scss',
  shadow: true
})
export class OgCardFooter {

  render() {
    return (
      <div class="og-card-footer">
        <slot></slot>
      </div>
    );
  }
}
