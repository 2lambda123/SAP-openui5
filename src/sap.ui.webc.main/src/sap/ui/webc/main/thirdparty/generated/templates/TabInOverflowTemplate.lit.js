sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-li-custom", tags, suffix)} id="${litRender.ifDefined(context._id)}" class="${litRender.ifDefined(context.overflowClasses)}" type="${litRender.ifDefined(context.overflowState)}" ?disabled="${context.effectiveDisabled}" aria-disabled="${litRender.ifDefined(context.effectiveDisabled)}" aria-selected="${litRender.ifDefined(context.effectiveSelected)}" aria-labelledby="${litRender.ifDefined(context.ariaLabelledBy)}" ._realTab="${litRender.ifDefined(context)}" style="${litRender.styleMap(context._style)}"><div class="ui5-tab-overflow-itemContent-wrapper"><div class="ui5-tab-overflow-itemContent">${ context.icon ? block1(context, tags, suffix) : undefined }${litRender.ifDefined(context.text)}${ context.additionalText ? block2(context) : undefined }</div></div></${litRender.scopeTag("ui5-li-custom", tags, suffix)}>${ litRender.repeat(context.subTabs, (item, index) => item._id || index, (item, index) => block3(item)) } `;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="${litRender.ifDefined(context.icon)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block2 = (context, tags, suffix) => litRender.html` (${litRender.ifDefined(context.additionalText)}) `;
	const block3 = (item, index, context, tags, suffix) => litRender.html`${litRender.ifDefined(item.overflowPresentation)}`;

	return block0;

});
