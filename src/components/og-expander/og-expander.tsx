/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, Element, Method, Host, Watch } from '@stencil/core';

@Component({
  tag: 'og-expander',
  styleUrl: 'og-expander.scss',
  shadow: true
})
export class OgExpander {
  @Element()
  public hostElement: HTMLElement;

  /**
   * The name for this expander
   */
  @Prop()
  public name: string;

  /**
   * Optional group identifier for this expander.
   * Expanders with same group will behave like an accordion, opening one expander will close other expanders.
   */
  @Prop()
  public group: string;

  /**
   * Sets or unsets the expanded state.
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public expanded: boolean = false;

  /**
   * Calculates and toggles the height of the Expander Body so it's possible
   * to add CSS transitions on open and close.
   */
  @Watch('expanded')
  public watchExpanded(value: boolean) {
    const height = this.expanderContent.scrollHeight;
    if (value) {
      this.expanderBodyHeight = height + 'px';
    } else {
      this.expanderBodyHeight = '0';
    }
  }

  private expanderBodyHeight = '0';
  private expanderContent: HTMLElement;

  /**
   * Use this method to toggle expanded state. Group property is respected when calling this method.
   */
  @Method()
  public async toggleExpandedState() {
    if (this.group) {
      const elements = document.querySelectorAll('og-expander');
      elements.forEach((element: HTMLOgExpanderElement) => {
        if (element.group === this.group && element !== this.hostElement) {
          element.expanded = false;
        }
      });
    }
    this.expanded = !this.expanded;
  }

  public render(): HTMLElement {
    return (
      <Host>
        <div class="og-expander">
          <div class="og-expander__header" onClick={() => { this.toggleExpandedState(); }}>
            <span class="og-expander__title">{this.name}</span>

            <div class="og-expander__button">
              <svg
                class={
                  'og-expander__button__arrow' +
                                (this.expanded
                                  ? ' og-expander__button__arrow--collapsed'
                                  : '')
                }
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 24 12"
                preserveAspectRatio="none"
              >
                <polyline
                  class="og-expander__button__arrow__line"
                  points="0,0 12,12 24,0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecaps="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div class="og-expander__body" style={{'height' : this.expanderBodyHeight }} >
            <div class="og-expander__content" ref={(el) => this.expanderContent = el} >
              <slot></slot>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
