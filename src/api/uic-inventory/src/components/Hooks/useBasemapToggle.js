import Basemap from '@arcgis/core/Basemap';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import { useEffect } from 'react';

export function useBasemapToggle(view) {
  useEffect(() => {
    view?.when(() => {
      const toggle = new BasemapToggle({
        view,
        nextBasemap: new Basemap({ portalItem: { id: '2ce710cbb88f4981bb517c255f638ff4' } }),
      });
      toggle.when(() => {
        toggle.container.style.transform = 'scale(0.5)';
        toggle.container.style.transformOrigin = 'top right';
      });
      view.ui.add(toggle, 'top-right');
    });
  }, [view]);
}
