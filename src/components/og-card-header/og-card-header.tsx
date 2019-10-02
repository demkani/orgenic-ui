/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { Component, Element, h } from '@stencil/core';

@Component({
  tag: 'og-card-header',
  styleUrl: 'og-card-header.scss',
  shadow: true
})
export class OgCardHeader {

  @Element() hostElement: HTMLElement;

  hasPrefix() {
    const prefixContent = this.hostElement.querySelector('[slot="prefix"]');
    return prefixContent ? true : false;
  }

  hasSuffix() {
    const suffixContent = this.hostElement.querySelector('[slot="suffix"]');
    return suffixContent ? true : false;
  }

  hasSub() {
    const suffixContent = this.hostElement.querySelector('[slot="sub"]');
    return suffixContent ? true : false;
  }

  render() {
    return (
      <div class="og-card-header">
        <div class="og-card-header__main">
          <div class="og-card-header__title">
            <slot></slot>
          </div>
          {
            this.hasSub() &&
            <div class="og-card-header__sub">
              <slot name="sub"></slot>
            </div>
          }
        </div>
        {
          this.hasSuffix() &&
          <div class="og-card-header__suffix">
            <slot name="suffix"></slot>
          </div>
        }
      </div>
    );
  }
}
