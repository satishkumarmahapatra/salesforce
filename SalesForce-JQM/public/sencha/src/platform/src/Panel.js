/**
 * @class Ext.lib.Panel
 * @extends Ext.Container
 * Shared Panel class
 */
Ext.lib.Panel = Ext.extend(Ext.Container, {
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this panel's element (defaults to <code>'x-panel'</code>).
     */
    baseCls : 'x-panel',

    /**
     * @cfg {Number/Boolean} bodyPadding
     * A shortcut for setting a padding style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing padding.
     * Defaults to <tt>undefined</tt>.
     */

    /**
     * @cfg {Number/Boolean} bodyMargin
     * A shortcut for setting a margin style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing margins.
     * Defaults to <tt>undefined</tt>.
     */

    /**
     * @cfg {Number/Boolean} bodyBorder
     * A shortcut for setting a border style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing borders.
     * Defaults to <tt>undefined</tt>.
     */

    isPanel: true,

    componentLayout: 'dock',

    renderTpl: ['<div class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>'],

    /**
     * @cfg {Object/Array} dockedItems
     * A component or series of components to be added as docked items to this panel.
     * The docked items can be docked to either the top, right, left or bottom of a panel.
     * This is typically used for things like toolbars or tab bars:
     * <pre><code>
var panel = new Ext.Panel({
    fullscreen: true,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            text: 'Docked to the bottom'
        }]
    }]
});</pre></code>
     */

    initComponent : function() {
        this.addEvents(
            /**
             * @event bodyresize
             * Fires after the Panel has been resized.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel body's new width.
             * @param {Number} height The Panel body's new height.
             */
            'bodyresize'
            // // inherited
            // 'activate',
            // // inherited
            // 'deactivate'
        );

        Ext.applyIf(this.renderSelectors, {
            body: '.' + this.baseCls + '-body'
        });

        Ext.lib.Panel.superclass.initComponent.call(this);
    },

    // @private
    initItems : function() {
        Ext.lib.Panel.superclass.initItems.call(this);

        var items = this.dockedItems;
        this.dockedItems = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.addDocked(items);
        }
    },

    /**
     * Finds a docked component by id, itemId or position
     * @param {String/Number} comp The id, itemId or position of the child component (see {@link #getComponent} for details)
     * @return {Ext.Component} The component (if found)
     */
    getDockedComponent: function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.dockedItems.get(comp);
    },

    /**
     * Attempts a default component lookup (see {@link Ext.Container#getComponent}). If the component is not found in the normal
     * items, the dockedItems are searched and the matched component (if any) returned (see {@loink #getDockedComponent}).
     * @param {String/Number} comp The docked component id or itemId to find
     * @return {Ext.Component} The docked component, if found
     */
    getComponent: function(comp) {
        var component = Ext.lib.Panel.superclass.getComponent.call(this, comp);
        if (component == undefined) {
            component = this.getDockedComponent(comp);
        }
        return component;
    },

    /**
     * Function description
     * @return {String} A CSS style string with style, padding, margin and border.
     * @private
     */
    initBodyStyles: function() {
        var bodyStyle = Ext.isString(this.bodyStyle) ? this.bodyStyle.split(';') : [],
            Element = Ext.Element;

        if (this.bodyPadding != undefined) {
            bodyStyle.push('padding: ' + Element.unitizeBox((this.bodyPadding === true) ? 5 : this.bodyPadding));
        }
        if (this.bodyMargin != undefined) {
            bodyStyle.push('margin: ' + Element.unitizeBox((this.bodyMargin === true) ? 5 : this.bodyMargin));
        }
        if (this.bodyBorder != undefined) {
            bodyStyle.push('border-width: ' + Element.unitizeBox((this.bodyBorder === true) ? 1 : this.bodyBorder));
        }
        delete this.bodyStyle;
        return bodyStyle.length ? bodyStyle.join(';') : undefined;
    },

    /**
     * Initialized the renderData to be used when rendering the renderTpl.
     * @return {Object} Object with keys and values that are going to be applied to the renderTpl
     * @private
     */
    initRenderData: function() {
        return Ext.applyIf(Ext.lib.Panel.superclass.initRenderData.call(this), {
            bodyStyle: this.initBodyStyles(),
            bodyCls: this.bodyCls
        });
    },

    /**
     * Adds docked item(s) to the panel.
     * @param {Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos (optional) The index at which the Component will be added
     */
    addDocked : function(items, pos) {
        items = this.prepareItems(items);

        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            item.dock = item.dock || 'top';
            if (pos !== undefined) {
                this.dockedItems.insert(pos+i, item);
            }
            else {
                this.dockedItems.add(item);
            }
            item.onAdded(this, i);
            this.onDockedAdd(item);
        }
        if (this.rendered) {
            this.doComponentLayout();
        }
    },

    // Placeholder empty functions
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    /**
     * Inserts docked item(s) to the panel at the indicated position.
     * @param {Number} pos The index at which the Component will be inserted
     * @param {Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     */
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    /**
     * Removes the docked item from the panel.
     * @param {Ext.Component} item. The Component to remove.
     * @param {Boolean} autoDestroy (optional) Destroy the component after removal.
     */
    removeDocked : function(item, autoDestroy) {
        if (!this.dockedItems.contains(item)) {
            return item;
        }

        var layout = this.componentLayout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(item);
        }

        this.dockedItems.remove(item);
        item.onRemoved();
        this.onDockedRemove(item);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            item.destroy();
        }

        if (hasLayout && !autoDestroy) {
            layout.afterRemove(item);
        }
        this.doComponentLayout();

        return item;
    },

    /**
     * Retrieve an array of all currently docked components.
     * @return {Array} An array of components.
     */
    getDockedItems : function() {
        if (this.dockedItems && this.dockedItems.items.length) {
            return this.dockedItems.items.slice();
        }
        return [];
    },

    // @private
    getTargetEl : function() {
        return this.body;
    },


    getRefItems: function(deep) {
        var refItems    = Ext.lib.Panel.superclass.getRefItems.call(this, deep),
            // deep does not account for dockedItems within dockedItems.
            dockedItems = this.getDockedItems(),
            ln          = dockedItems.length,
            i           = 0,
            item;

        refItems = refItems.concat(dockedItems);

        if (deep) {
            for (; i < ln; i++) {
                item = dockedItems[i];
                if (item.getRefItems) {
                    refItems = refItems.concat(item.getRefItems(true));
                }
            }
        }

        return refItems;
    },
    
    beforeDestroy: function(){
        var docked = this.dockedItems,
            c;
            
        if (docked) {
            while ((c = docked.first())) {
                this.removeDocked(c, true);
            }
        }
        Ext.lib.Panel.superclass.beforeDestroy.call(this);
    }
});

// Declare here so we can test
Ext.Panel = Ext.extend(Ext.lib.Panel, {});
Ext.reg('panel', Ext.Panel);
