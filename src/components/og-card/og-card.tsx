/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component } from '@stencil/core';

@Component({
  tag: 'og-card',
  styleUrl: 'og-card.scss',
  shadow: true
})
export class OgCard {
  public render() {
    return (
      <div class="og-card">
        <slot></slot>
      </div>
    );
  }
}
