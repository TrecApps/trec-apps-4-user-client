
export type SortFunction = (a: any, b: any) => number;

export class SortedList<T> implements Iterable<T> {

    items: T[] = [];

    sorter: SortFunction;

    constructor(sorter: SortFunction) {
        this.sorter = sorter;
    }


    [Symbol.iterator](): Iterator<T, any, any> {
        let index = 0;
        const items = this.items;

        return {
            next(): IteratorResult<T> {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                } else {
                    return { value: undefined, done: true };
                }
            },
        };
    }

    add(item: T): number{
        if(this.items.length === 0 || this.sorter(this.items[this.items.length - 1], item) < 0){
            this.items.push(item);
            return this.items.length;
        }

        // check if element is lower than the current lowest
        if(this.sorter(this.items[0], item) > 0)
        {
            this.items.unshift(item);
            return this.items.length;
        }

        let index = this.indexOf(item, false);
        if(index == -1){
            // This should never happen
            return this.items.length;
        }

        this.items.splice(index, 0, item);
        return this.items.length;
    }

    contains(element: T): boolean {
        return this.indexOf(element) !== -1;
    }

    indexOf(element: T, directTarget: boolean = true): number {
        if(this.items.length === 0) return -1;

        return this.halfSearch(0, this.items.length, element, directTarget);
    }

    clear() {
        this.items = [];
    }
    

    /**
     * 
     * @param low the inclusive lower index to search
     * @param high the exclusive upper index to search
     * @param element the element to search
     * @param directTarget if true, need to find the extact element. If False, will accept a space between the target element (for the add function)
     */
    private halfSearch(low: number, high: number, element: T, directTarget: boolean = true): number {
        let start =Math.floor((high - low) / 2 + low);

        if(start > this.items.length){
            return -1;
        }
        if(start == this.items.length){
            return directTarget ? -1: start;
        }

        let compare = this.sorter(this.items[start], element);

        // if true, we have found the element
        if(compare === 0) return start;

        // Haven't found the element, check to see if we have found the add space 

        if(!directTarget){
            // We are not looking specfifically for the same element, so see how the new element compares to the surrounding one
            //  and if we could report the target index here
            if(compare > 0){
                // Target item was less than the 'just-checked' element, look to see if the i-1 element is less than target item
                if(start === 0) return 0;
                if(this.sorter(this.items[start - 1], element) < 0) return start;

            } else {
                if(start >= this.items.length - 1) return this.items.length;
                if(this.sorter(this.items[start + 1], element) < 0) return start + 1;
            }
        }

        if(!directTarget && (compare > 0) && (start + 1 < this.items.length) && (this.sorter(this.items[start + 1], element) < 0)) return start + 1;

        // If the element are the same, cannot search further, so return -1
        if(high == low) return -1;

        if(compare > 0)
            return this.halfSearch(low, start, element, directTarget);
        return this.halfSearch(start + 1, high, element, directTarget);
    }


}