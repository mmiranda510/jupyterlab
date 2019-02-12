/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';
import { InstanceTracker } from '@jupyterlab/apputils';
import {
  extractWidgetArgs,
  IDataBus,
  widgetViewerConverter
} from '@jupyterlab/databus';
import { Widget } from '@phosphor/widgets';

const tracker = new InstanceTracker({ namespace: 'databus' });
const commandID = 'databus:view-url';

export default {
  activate,
  id: '@jupyterlab/databus-extension:widgets',
  requires: [ILabShell, IDataBus, ILayoutRestorer],
  autoStart: true
} as JupyterFrontEndPlugin<void>;

function activate(
  app: JupyterFrontEnd,
  labShell: ILabShell,
  dataBus: IDataBus,
  restorer: ILayoutRestorer
) {
  dataBus.converters.register(
    widgetViewerConverter(async (widget: Widget) => {
      if (!tracker.has(widget)) {
        await tracker.add(widget);
      }
      if (!widget.isAttached) {
        labShell.add(widget, 'main');
      }
      app.shell.activateById(widget.id);
    })
  );

  app.commands.addCommand(commandID, {
    execute: async args => {
      await dataBus.viewURL(new URL(args.url as string), args.label as string);
    },
    label: args => `${args.label} ${args.url}`
  });

  restorer.restore(tracker, {
    name: (widget: Widget) => widget.id,
    command: commandID,
    args: extractWidgetArgs
  });
}
