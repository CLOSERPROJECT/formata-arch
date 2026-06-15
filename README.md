# Form builder

## Embedding single-form builder

Host apps can embed the visual builder for one JSON Schema + uiSchema pair without loading or
saving a workflow stream:

```html
<iframe src="/formata-builder/#/single-form?load=/api/form-config&save=/api/form-config"></iframe>
```

The `load` endpoint is requested with `GET` and must return:

```json
{ "schema": { "type": "object", "properties": {} }, "uiSchema": {} }
```

On save, Formata-Arch validates the builder state, then `POST`s the same shape to `save` when
provided. It also emits:

```js
window.parent.postMessage(
	{ type: 'formata:schema-saved', schema, uiSchema },
	'<target-origin>'
);
```

As an alternative to `load`, the parent frame can initialize the builder with:

```js
iframe.contentWindow.postMessage(
	{ type: 'formata:schema-load', schema, uiSchema },
	window.location.origin
);
```

For cross-origin embeds, pass `targetOrigin` in the iframe URL to control where
`formata:schema-ready` and `formata:schema-saved` messages are sent.

The host remains responsible for authorization, audit metadata, and persistence.
