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
  - [x] Add dumpPath config
  - [x] Add debug config
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
- [x] Add backup and restore methods
- [x] Add replication of DB to all Bags for safe-case
  - [x] Add on error dump one bag to backup
- [x] Add Logger for debugging
  - [ ] Add dumping of trace to a filepath for Basket.dump
- [x] Add internalBag to Basket
  - [x] Add oldRepel for Dumping DB state before error
- [x] Add stats system
- [ ] Add custom writer for writing changes only
- [ ] Add use of setTimeout instead of date comparison for Trashman markings for accuracy
- [x] Add keyExists method
  - [x] Make keyExistsMemory and new keyExists exposed to Basket without queuing a task
- [x] Add each method to loop over each key value pair in DB
- [x] Add CLI
  - [ ] Make CLI "fool proof" by checking for all arguments etc

## Bugs

- [ ] searchAndRemove and searchAndRemoveMany both call onComplete twice
