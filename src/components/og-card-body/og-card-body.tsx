/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { Component, h } from '@stencil/core';

@Component({
  tag: 'og-card-body',
  styleUrl: 'og-card-body.scss',
  shadow: true
})
export class OgCardBody {
  render() {
    return (
      <div class="og-card-body">
        <slot></slot>
      </div>
    );
  }
}
