////////////////////////////////////////////////////////////////////////////
// Bit-map container
//
// A set of integers taken from a range going from zero to an arbitrary
// upper bound. Optimized to fast intersection, union, insertion and
// membership test.
//
// Members are kept as bit in an array of 32-bits entries, one bit per
// integer.

class BitMap {
  constructor(items) {
    this.bits = [0]
    if (items != undefined) {
      for (let item of items)
        this.add(item)
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // Item access functions.

  // Iterate over all contained integers.
  [Symbol.iterator]() {
    return new BitMapIterator(this)
  }

  // Iterate over all contained integers.
  values() {
    return new BitMapIterator(this)
  }

  // Iterate over all contained integers.
  keys() {
    return new BitMapIterator(this)
  }

  // Get the first integer kept in the set.
  first_value() {
    for (let i = 0; i < this.bits.length; ++i) {
      if (this.bits[i] != 0) {
        i *= 32
        while (true) {
          if (this.has(i))
            return i
          i++
        }
      }
    }
    return -1
  }

  // Verify if the given integer is in the set.
  has(item) {
    return (((this.bits[(item / 32 | 0)]) & (1 << (item % 32))) != 0)
  }

  // Verify if the set contains all integers up to and including the given one
  has_all(maxItemCount) {
    const count = maxItemCount / 32 | 0
    for (let i = 0; i < count - 1; ++i)
      if (this.bits[i] != -1)
        return false
    for (let i = (this.bits.length - 1) * 32; i < maxItemCount; ++i)
      if (!this.has(i))
        return false
    return true
  }

  // Get the size of the set -- the number of integers that are members.
  size() {
    let count = 0
    for (let i = 0; i < this.bits.length * 32; ++i)
      if (this.has(i))
        count++
    return count
  }

  //////////////////////////////////////////////////////////////////////////
  // Insertion and removal functions

  // Add an integer to the set.
  add(item) {
    const pos = (item / 32) | 0
    if (pos >= this.bits.length)
      this._extend(pos + 1)
    this.bits[pos] = this.bits[pos] | (1 << (item % 32))
  }

  // Remove an integer from the set.
  delete(item) {
    const pos = (item / 32) | 0
    if (pos >= this.bits.length)
      return
    this.bits[pos] = this.bits[pos] & ~(1 << item % 32)
  }

  // Fill the set with all integers up to and including the given integer.
  fill(itemCount) {
    for (let i = itemCount - 1; i >= 0; --i)
      this.add(i)
  }

  // Remove all integers from the set.
  clear() {
    this.bits.fill(0, 0)
  }

  //////////////////////////////////////////////////////////////////////////
  // Whole set functions

  // Merge the given set into this set.
  in_place_union(other) {
    if (other.bits.length > this.bits.length)
      this._extend(other.bits.length)
    for (let i = 0; i < other.bits.length; ++i)
      this.bits[i] |= other.bits[i]
  }

  // Intersect the given set with this set, keeping only integers that are
  // in both sets.
  in_place_intersection(other) {
    const count = Math.min(this.bits.length, other.bits.length)
    let changed = this._truncate(count)
    for (let i = 0; i < other.bits.length; ++i) {
      const preBits = this.bits[i]
      this.bits[i] &= other.bits[i]
      if (this.bits[i] != preBits) {
        changed = true
      }
    }
    return changed
  }

  // Remove all integers contained in the given set.
  in_place_difference(other) {
    let changed = false
    for (let i = 0; i < other.bits.length; ++i) {
      const preBits = this.bits[i]
      this.bits[i] &= ~other.bits[i]
      if (this.bits[i] != preBits) {
        changed = true
      }
    }
    return changed
  }

  //////////////////////////////////////////////////////////////////////////
  // Set comparison functions.

  // Verify if this set contains no integers from the given set.
  is_disjoint_from(other) {
    const count = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < count; ++i)
      if (this.bits[i] & other.bits[i] != 0)
        return false
    return true
  }

  // Verify if this set in contained in the given set.
  is_subset_of(other) {
    const count = Math.min(this.bits.length, other.bits.length)
    for (let i = 0; i < count; ++i)
      if (this.bits[i] & ~other.bits[i] != 0)
        return false
    for (let i = count; i < this.bits.length; ++i)
      if (this.bits[i] != 0)
        return false
    return true
  }

  // Verify if this set contains the given set.
  is_superset_of(other) {
    return other.is_subset_of(this)
  }

  //////////////////////////////////////////////////////////////////////////
  // Conversion functions

  // Convert the set to an array of integers.
  to_array() {
    let arr = []
    for (let i = 0; i < this.bits.length * 32; ++i) {
      if (this.has(i))
        arr.push(i)
    }
    return arr
  }


  //////////////////////////////////////////////////////////////////////////
  // Internal implementation details functions

  // Extend the set internal array to a new length.
  _extend(newLength) {
    const start = this.bits.length
    this.bits.length = newLength
    this.bits.fill(0, start)
  }

  // Truncate the set internal array to the given length.
  // Return true if the set contents changed due to the truncation.
  _truncate(newLength) {
    changed = false
    for (let i = newLength; i < this.bits.length; ++i)
      if (this.bits[i] != 0)
        changed = true
    this.bits.length = newLength
    return changed
  }

}

////////////////////////////////////////////////////////////////////////////
// Bit-map iterator
//
// Iterate over all the integers contained in a BitMap

class BitMapIterator {
  constructor(bm) {
    this.bitmap = bm
    this.index = -1
    this.done = false
    this.value = undefined
  }

  next() {
    while (true) {
      this.index += 1
      if (this.index >= this.bitmap.bits.length * 32) {
        this.done = true
        this.value = undefined
        return this
      }
      if (this.bitmap.has(this.index)) {
        this.value = this.index
        return this
      }
    }
  }

  [Symbol.iterator]() {
    return this
  }
}
