/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, EventEmitter, Event, Element, State, Method } from '@stencil/core';
import ResizeObserver from 'resize-observer-polyfill';

@Component({
  tag: 'og-tabs',
  styleUrl: 'og-tabs.scss',
  shadow: true
})
export class OgTabs {
  @Element()
  public hostElement: HTMLElement;

  @State()
  public tabs: HTMLOgTabElement[] = [];

  public ro: ResizeObserver;

  private nav: HTMLUListElement;
  private activeTabIndex: number;
  private activeTabWidth: number;
  private activeTabOffsetLeft: number;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop({ reflectToAttr: true })
  public disabled: boolean;

  /**
   * Determines, whether the tabs strech to full width when poissible or not.
   */
  @Prop({ reflectToAttr: true })
  public grow: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public tabSelected: EventEmitter<number>;

  @Method()
  public async openTab(index: number): Promise<HTMLElement> {
    if (this.disabled) {
      return;
    }
    if (index >= this.tabs.length) {
      throw new Error(
        `[og-tabs] Index ${index} is out of bounds of tabs length`
      );
    }
    if (!this.tabs[index].disabled) {
      this.tabs = this.tabs.map((tab, i) => {
        tab.selected = i === index;
        return tab;
      });
    }
    this.activeTabIndex = index;
    this.assignActiveTabMeasures();
    this.tabSelected.emit(index);
  }

  public componentWillLoad() {
    // Grab tabs from this component
    this.tabs = Array.from(this.hostElement.querySelectorAll('og-tab'));
    if (this.tabs.length === 0) {
      throw new Error('[og-tabs] Must have at least one tab');
    }
  }

  public componentDidLoad() {
    this.checkInitialActiveTab();
    this.ro = new ResizeObserver(() => {
      this.assignActiveTabMeasures()
    });
  this.ro.observe(this.hostElement);
  }

  public componentDidUnload() {
    this.ro.unobserve(this.hostElement);
  }

  /**
   * Checks if a selected item is set.
   */
  private checkInitialActiveTab() {
    this.activeTabIndex = this.tabs.findIndex(item => item.selected);
    if (this.activeTabIndex >= 0) {
      this.openTab(this.activeTabIndex);
    }
  }

  /**
   * Calcualtes the
   */
  private assignActiveTabMeasures() {
    if (this.activeTabIndex >= 0) {
      this.activeTabWidth = (this.nav.children[this.activeTabIndex] as HTMLElement).offsetWidth;
      this.activeTabOffsetLeft = (this.nav.children[this.activeTabIndex] as HTMLElement).offsetLeft;
    }
  }

  public render(): HTMLElement {
    return (
      <div class="og-tabs">
        <nav class="og-tabs__nav">
          <ul
            ref={el => this.nav = el}
            class={{
              "og-tabs__list": true,
              "og-tabs__list--grow": this.grow,
            }}
          >
            {this.tabs.map((tab, index): HTMLElement => {
              return (
                <li
                  class={{
                    "og-tabs__list-item": true,
                    "og-tabs__list-item--selected": tab.selected,
                    "og-tabs__list-item--disabled": tab.disabled,
                  }}
                >
                  <button
                    role="tab"
                    class={{
                      "og-tabs__tab": true,
                      " og-tabs__tab--selected": tab.selected,
                    }}
                    disabled={ this.disabled || tab.disabled }
                    onClick={() => this.openTab(index)}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            class="og-tabs__indicator"
            style={{
              width: this.activeTabWidth + "px",
              left: this.activeTabOffsetLeft + "px"
            }}
          />
        </nav>
        <div class="og-tabs__content-container">
          <div class="og-tabs__content">
            <slot></slot>
          </div>
        </div>
      </div>
    );
  }
}
