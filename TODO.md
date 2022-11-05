# Todo

- [x] Add support for Array or Object type for database
- [x] Add searchIndex method
- [x] Add rename method
- [x] Add modify method
- [x] Add modifyMany method
- [x] Add addMany method
- [x] Add new removing system
  - [x] Add new Trashman system to mark a trash time and remove once trash time has been reached
  - [x] Add __markedForRemoval prop to items when marked
- [x] Add removeInstantly
- [x] Add removeInstantlyMany method
- [x] Add config to Basket
  - [x] Add Trashman time config
  - [ ] Add debug config
- [x] Add remove
- [x] Add removeMany
- [x] Add searchMany method
- [x] Add searchAndModify method
- [x] Add searchAndModifyMany method
- [x] Add searchAndRemove method
- [x] Add searchAndRemoveMany method
- [x] Add searchAndRemoveInstantly method
- [x] Add searchAndRemoveInstantlyMany method
- [x] Add totalSize getter
- [ ] Add createView method to search for key pattern
- [ ] Add backup and restore methods
- [ ] Add replication of DB to all Bags for safe-case
- [ ] Add Logger for debugging
- [ ] Add stats system

## Bugs

- [ ] searchAndRemove and searchAndRemoveMany both call onComplete twice
