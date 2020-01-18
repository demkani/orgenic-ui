/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop } from '@stencil/core';

@Component({
  tag: 'og-tab',
  styleUrl: 'og-tab.scss',
  shadow: true
})
export class OgTab {
  /**
   * The label of the tab
   */
  @Prop()
  public label: string;

  @Prop({ reflectToAttr: true })
  public selected: boolean;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop({ reflectToAttr: true })
  public disabled: boolean;

  public render(): HTMLElement {
    return (
      <div class="og-tab">
        <slot></slot>
      </div>
    );
  }
}
