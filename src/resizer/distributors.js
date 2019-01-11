/*
Copyright 2018 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
distributors translate a moving cursor into
CSS/DOM changes by calling the sizer

they have two methods:
    `resize` receives then new item size
    `resizeFromContainerOffset` receives resize handle location
        within the container bounding box. For internal use.
        This method usually ends up calling `resize` once the start offset is subtracted.
the offset from the container edge of where
the mouse cursor is.
*/
class FixedDistributor {
    constructor(item) {
        this.item = item;
        this.beforeOffset = item.offset();
    }

    resize(size) {
        this.item.setSize(size);
    }

    resizeFromContainerOffset(offset) {
        this.resize(offset - this.beforeOffset);
    }

    start() {}

    finish() {}
}


class CollapseDistributor extends FixedDistributor {
    constructor(item, sizer, _container, config) {
        super(item);
        this.toggleSize = config && config.toggleSize;
        this.onCollapsed = config && config.onCollapsed;
        this.isCollapsed = false;
    }

    resize(newSize) {
        const isCollapsedSize = newSize < this.toggleSize;
        if (isCollapsedSize && !this.isCollapsed) {
            this.isCollapsed = true;
            if (this.onCollapsed) {
                this.onCollapsed(true, this.item);
            }
        } else if (!isCollapsedSize && this.isCollapsed) {
            if (this.onCollapsed) {
                this.onCollapsed(false, this.item);
            }
            this.isCollapsed = false;
        }
        if (!isCollapsedSize) {
            super.resize(newSize);
        }
    }
}

module.exports = {
    FixedDistributor,
    CollapseDistributor,
};
