//Create, Read, Write, Query Database
//http://localhost:5984/_utils/#/_all_dbs

class Database {
  constructor() {
    //console.group('database constructor');
    // REF Pouchdb login
    // https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/setup.md
    this.dbAssess = new PouchDB(
      "http://admin:escape88@localhost:5984/bcassessment",
      {
        skip_setup: true,
      }
    );
    // Try to use pouchDB plugin to login, but not work
    // this.dbAssess.logIn("admin", "escape88", (err, res) => {
    //   console.log(res);
    // });
    this.dbComplex = new PouchDB(
      "http://admin:escape88@localhost:5984/complex",
      {
        skip_setup: true,
      }
    );
    // this.dbComplex.logIn("admin", "escape88", (res) => {
    //   console.log(res);
    // });
    this.dbExposure = new PouchDB(
      "http://admin:escape88@localhost:5984/exposure",
      {
        skip_setup: true,
      }
    );
    // this.dbExposure.logIn("admin", "escape88", (res) => {
    //   console.log(res);
    // });
    this.dbDebug = new PouchDB(
      "http://admin:escape88@localhost:5984/debugsettings",
      {
        skip_setup: true,
      }
    );

    this.dbListing = new PouchDB(
      "http://admin:escape88@localhost:5984/listing",
      {
        skip_setup: true,
      }
    );
    // this.dbListing.logIn("admin", "escape88", (res) => {
    //   console.log(res);
    // });
    //http://localhost:5984/_utils/#/database/exposure/_all_docs
    this.dbStrataPlanSummary = new PouchDB(
      "http://admin:escape88@localhost:5984/strataplansummary",
      {
        skip_setup: true,
      }
    );
    // this.dbStrataPlanSummary.logIn("admin", "escape88", (res) => {
    //   console.log(res);
    // });
    this.dbShowing = new PouchDB(
      "http://admin:escape88@localhost:5984/showing",
      {
        skip_setup: true,
      }
    );
    // this.dbShowing.logIn("admin", "escape88", (res) => {
    //   console.log(res);
    // });

    // this.dbAssess.info().then(function (info) {
    //   console.log(info);
    // });
    // this.dbComplex.info().then(function (info) {
    //   console.log(info);
    // });
    // this.dbExposure.info().then(function (info) {
    //   console.log(info);
    // });
    // this.dbListing.info().then(function (info) {
    //   console.log(info);
    // });
    // this.dbStrataPlanSummary.info().then(function (info) {
    //   console.log(info);
    // });
    // this.dbShowing.info().then(function (info) {
    //   console.log(info);
    // });
    this.assess = null;
    this.complex = null;
    this.exposure = null;
    this.strataPlan = null;
    this.showing = null;
    //console.groupEnd('database constructor');
  }

  async readAssessPromise(taxID) {
    var self = this;
    try {
      let taxAssess = await self.dbAssess.get(taxID);
      self.assess = taxAssess;
      taxAssess.from = "assess-" + Math.random().toFixed(8);
      taxAssess.dataFromDB = true;
      switch (String(taxAssess.bcaSearch)) {
        case "success":
          // 成功的数据, 返回该数据包
          return Promise.resolve(taxAssess);
        default:
          // 失败的数据, 以错误的形式返回数据包
          return Promise.reject(taxAssess);
      }
    } catch (err) {
      // 数据库读取错误, 抛出错误信息
      return Promise.reject(err);
    }
  }

  async readAssess(taxID, callback) {
    var self = this;
    /// 更改为async/await版本
    try {
      const assessDoc = await self.dbAssess.get(taxID);
      let assess = (self.assess = assessDoc);
      assess.from = "assess-" + Math.random().toFixed(8);
      assess.dataFromDB = true;
      callback(self.assess);
    } catch (err) {
      self.assess = {};
      self.assess.from = "assess-" + Math.random().toFixed(8);
      self.assess.dataFromDB = true;
      self.assess._id = null;
      callback(self.assess);
    }

    // self.dbAssess
    //   .get(taxID)
    //   .then(function (doc) {
    //     var assess = (self.assess = doc);
    //     //console.log(">>>read the tax info in database is: ", assess);
    //     assess.from = "assess-" + Math.random().toFixed(8);
    //     assess.dataFromDB = true;
    //     callback(self.assess);
    //   })
    //   .catch(function (err) {
    //     //console.log(">>>read database error: ", err);
    //     self.assess = {};
    //     self.assess.from = "assess-" + Math.random().toFixed(8);
    //     self.assess.dataFromDB = true;
    //     self.assess._id = null;
    //     callback(self.assess);
    //   });
  }

  readAssess_v6(taxID, callback) {
    //console.group(">>>readAssess");
    var self = this;
    try {
      self.dbAssess.get(taxID, function (err, doc) {
        if (err) {
          self.assess = null;
          callback(self.assess);
        } else {
          var assess = (self.assess = doc);
          assess.from = "assess-" + Math.random().toFixed(8);
          assess.dataFromDB = true;
          callback(self.assess);
        }
      });
    } catch (err) {
      console.warn(err);
      self.assess = null;
      callback(self.assess);
    }
  }

  async writeAssessPromise(assess) {
    /// ADD promise version of writeAssess
    var taxID = assess._id;
    var self = this;
    assess.dataFromDB = true;
    var d = new Date();
    assess.addedDate =
      d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
    // 写数据之前, 用taxID读取记录, 如果有重复的数据, 就取得_rev
    try {
      const assessDoc = await self.dbAssess.get(taxID);
      assess._rev = assessDoc._rev;
    } catch (err) {
      // TODO 需要增加读取数据发生错误时候的处理代码
      console.log(`Read CouchDB Err:${err}`);
      // CouchDB数据库中没有相关记录, 需要写入新的数据
    }
    try {
      const writeRes = await self.dbAssess.put(assess);
      return Promise.resolve(writeRes);
    } catch (err) {
      // TODO 需要增加写CouchDB发生错误的代码
      console.log(`write CouchDB Error: ${err}`);
      return Promise.reject(err);
    }
  }

  async writeAssess(assess) {
    /// ADD promise version of writeAssess
    var taxID = assess._id;
    var self = this;
    assess.dataFromDB = true;
    var d = new Date();
    assess.addedDate =
      d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
    // 写数据之前, 用taxID读取记录, 如果有重复的数据, 就取得_rev
    try {
      const assessDoc = await self.dbAssess.get(taxID);
      assess._rev = assessDoc._rev;
    } catch (err) {
      // TODO 需要增加读取数据发生错误时候的处理代码
      console.log(`Read CouchDB Err:${err}`);
    }
    try {
      const writeRes = await self.dbAssess.put(assess);
    } catch (err) {
      // TODO 需要增加写CouchDB发生错误的代码
      console.log(`write CouchDB Error: ${err}`);
    }
    return assess;
    // self.dbAssess.get(taxID).then((doc) => {
    //   assess._rev = doc._rev;
    //   self.dbAssess
    //     .put(assess)
    //     .then(function () {
    //       return self.dbAssess.get(taxID);
    //     })
    //     .then(function (doc) {
    //       //console.log(">>>bc assessment has been saved to db: ", doc);
    //     })
    //     .catch(function (err) {
    //       //console.log(">>>save bc assessment error: ", err);
    //       self.dbAssess
    //         .get(taxID)
    //         .then(function (doc) {
    //           return self.dbAssess.remove(doc);
    //         })
    //         .catch(function (err) {
    //           //console.log(">>>remove bc assess error: ", err);
    //         });
    //     });
    // }
  }

  async readStrataPlanSummary_Promise(strataPlan) {
    //console.group('readStrataPlanSummary');
    //console.log(">>>this in Database is: ", this);
    var self = this;
    try {
      let strataPlan = await self.dbStrataPlanSummary.get(strataPlan);
      self.strataPlan = strataPlan;
      await chrome.storage.local.set({
        active: strataPlan.active,
        sold: strataPlan.sold,
        count: strataPlan.count,
        searchDate: strataPlan.searchDate,
        complex: strataPlan.complex,
        strataPlan: strataPlan._id,
        from: "strataPlanSummary" + Math.random().toFixed(8),
      });
      return Promise.resolve(strataPlan);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  readStrataPlanSummary(strataPlan, callback) {
    //console.group('readStrataPlanSummary');
    //console.log(">>>this in Database is: ", this);
    var self = this;
    self.dbStrataPlanSummary
      .get(strataPlan)
      .then(function (doc) {
        self.strataPlan = doc;
        //console.log(">>>read the strataPlanSummary in database is: ", self.strataPlan);
        chrome.storage.local.set({
          active: doc.active,
          sold: doc.sold,
          count: doc.count,
          searchDate: doc.searchDate,
          complex: doc.complex,
          strataPlan: doc._id,
          from: "strataPlanSummary" + Math.random().toFixed(8),
        });
        callback(self.strataPlan);
      })
      .catch(function (err) {
        //console.log(">>>read database strataPlanSummary error: ", err);
        self.strataPlan = null;
        callback(self.strataPlan);
      });
    //console.groupEnd('readStrataPlanSummary');
  }

  writeStrataPlanSummary(strataplan) {
    //console.group('writeStrataPlanSummary');
    var strataPlan = strataplan._id;
    var self = this;
    self.dbStrataPlanSummary
      .put(strataplan)
      .then(function () {
        return self.dbStrataPlanSummary.get(strataPlan);
      })
      .then(function (doc) {
        //console.log(">>>StrataPlan Summary has been saved to dbComplex: ", doc);
      })
      .catch(function (err) {
        //console.log(">>>save StrataPlan Summary error: ", err);
        self.dbStrataPlanSummary
          .get(strataPlan)
          .then(function (doc) {
            return self.dbStrataPlanSummary.remove(doc);
          })
          .catch(function (err) {
            //console.log(">>>remove StrataPlan Summary error: ", err);
          });
      });
    //console.groupEnd('writeStrataPlanSummary');
  }

  async readComplexPromise(complexInfo) {
    /// 功能说明: 从CouchDB中查询小区信息
    /// 如果小区名字不为空
    var self = this;
    self.complex = complexInfo;
    try {
      let res = await self.dbComplex.get(complexInfo._id);
      self.complex = res;
      self.complex.from = "complexInfo" + Math.random().toFixed(8);
      return Promise.resolve(self.complex);
    } catch (err) {
      return Promise.reject(err); // 返回错误信息
    }
  }

  async createComplexPromise(complexInfo) {
    /// 功能说明: 创建小区名字记录
    var self = this;
    if (complexInfo.complexName.trim() === "") {
      /// 如果小区数据里面的名字为空, 则填入TBA
      complexInfo.complexName = "TBA";
    }
    try {
      let res = await self.dbComplex.put(complexInfo);
      return Promise.resolve(res);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateComplexPromise(complexInfo) {
    /// 功能说明: 更新区名字记录
    var self = this;
    var complexID = complexInfo._id;
    var complexName = complexInfo.complexName;

    try {
      /// 先读取原有的记录, 取得_rev字段
      let res = await self.dbComplex.get(complexID);
      /// 更新小区名, 存入数据库
      res.complexName = complexName.trim() === "" ? "TBA" : complexName;
      let res2 = await self.dbComplex.put(res);
      return Promise.resolve(res2);
    } catch (err) {
      return Promise.reject(res2);
    }
  }

  readComplex(complexInfo, callback) {
    //console.group(">>>readComplex");
    var self = this;
    self.complex = complexInfo;

    self.dbComplex.get(complexInfo._id, function (err, doc) {
      if (err) {
        self.writeComplex(self.complex);
        self.complex.from =
          "complexInfo-saved to db-" + Math.random().toFixed(8);
        callback(self.complex);
      } else {
        self.complex = doc;
        self.complex.from = "complexInfo" + Math.random().toFixed(8);
        callback(self.complex);
      }
    });
  }

  writeComplex(complex) {
    //console.group('>>>writeComplex');
    var complexID = complex._id;
    var self = this;
    var complexName = complex.name;
    self.dbComplex
      .get(complexID)
      .then(function (doc) {
        //console.log('writeComplex...the complex EXISTS, pass writing');
        doc["name"] = complexName;
        doc["complexName"] = complexName;
        self.dbComplex.put(doc);
        return [doc, "complex updated!"];
      })
      .catch(function (err) {
        self.dbComplex
          .put(complex)
          .then(function () {
            //console.log('SAVED the complex info to database:', complex.name);
            return self.dbComplex.get(complexID);
          })
          .then(function (doc) {
            //console.log(">>>Complex Info has been saved to dbComplex: ", doc);
          })
          .catch(function (err) {
            //console.log(">>>save Complex info error: ", err);
          });
      });
    //console.groupEnd('>>>writeComplex');
  }

  readExposure(exposureInfo, callback) {
    //console.group(">>>readComplex");
    var self = this;
    self.exposure = exposureInfo;

    self.dbExposure.get(exposureInfo._id, function (err, doc) {
      if (err) {
        self.writeExposure(self.exposure);
        self.exposure.from = "exposure-saved to db-" + Math.random().toFixed(8);
        callback(self.exposure);
      } else {
        self.exposure = doc;
        self.exposure.from = "exposure" + Math.random().toFixed(8);
        callback(self.exposure);
      }
    });
  }

  writeExposure(exposure) {
    //console.group('>>>writeComplex');
    var exposureID = exposure._id;
    var self = this;
    var exposureName = exposure.name;
    self.dbExposure
      .get(exposureID)
      .then(function (doc) {
        //console.log('writeComplex...the complex EXISTS, pass writing');
        doc["name"] = exposureName;
        self.dbExposure.put(doc);
        return [doc, "exposure updated!"];
      })
      .catch(function (err) {
        self.dbExposure
          .put(exposure)
          .then(function () {
            //console.log('SAVED the complex info to database:', complex.name);
            return self.dbExposure.get(exposureID);
          })
          .then(function (doc) {
            //console.log(">>>Complex Info has been saved to dbComplex: ", doc);
          })
          .catch(function (err) {
            //console.log(">>>save Complex info error: ", err);
          });
      });
    //console.groupEnd('>>>writeComplex');
  }

  /// 调取调试设定
  async readDebugSetting(debugID) {
    let resInfo = null;
    try {
      let debugSetting = await this.dbDebug.get(debugID);
      return Promise.resolve(debugSetting);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async loadDebugSettings() {
    const query = {
      selector: {
        _id: {
          $gt: null,
        },
      },
    };
    try {
      let resultInfos = await this.dbDebug.allDocs({ include_docs: true });
      let debugSettings = resultInfos.rows.map((row) => row.doc);
      return Promise.resolve(debugSettings);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  readListing(listingInfo, callback) {
    //console.group(">>>readComplex");
    var self = this;
    self.listing = listingInfo;

    self.dbListing.get(listingInfo._id, function (err, doc) {
      if (err) {
        self.writeListing(self.listing);
        self.listing.from = "listing-saved to db-" + Math.random().toFixed(8);
        callback(self.listing);
      } else {
        self.listing = doc;
        self.listing.from = "listing" + Math.random().toFixed(8);
        callback(self.listing);
      }
    });
  }

  writeListing(listing) {
    //console.group('>>>writeListing');
    var listingID = listing._id;
    var self = this;
    var listingName = listing.name;
    self.dbListing
      .get(listingID)
      .then(function (doc) {
        //console.log('writeListing...the listing EXISTS, pass writing');
        doc["name"] = listingName;
        self.dbListing.put(doc);
        return [doc, "listing updated!"];
      })
      .catch(function (err) {
        self.dbListing
          .put(listing)
          .then(function () {
            //console.log('SAVED the listing info to database:', listing.name);
            return self.dbListing.get(listingID);
          })
          .then(function (doc) {
            //console.log(">>>Listing Info has been saved to dbListing: ", doc);
          })
          .catch(function (err) {
            //console.log(">>>save Listing info error: ", err);
          });
      });
    //console.groupEnd('>>>writeListing');
  }

  readShowing(showingInfo, callback) {
    //console.group(">>>readShowing");
    var self = this;
    self.showing = showingInfo;

    self.dbShowing.get(showingInfo._id, function (err, doc) {
      if (err) {
        //console.log(">>>read database showing error: ", err);
        self.writeShowing(self.showing);
        self.showing.from = "showing-saved to db-" + Math.random().toFixed(8);
        callback(self.showing);
      } else {
        self.showing = doc;
        //console.log(">>>read the showing Info in database is: ", self.showing);
        self.showing.from = "showing-" + Math.random().toFixed(8);
        callback(self.showing);
      }
    });
    //console.groupEnd(">>>readShowing");
  }

  writeShowing(showing) {
    var showingID = showing._id;
    var self = this;
    var showingName = showing.name;
    var clientName = showing.clientName;
    var showingNote = showing.showingNote;
    var showingDate = showing.showingDate;
    var showingTime = showing.showingTime;
    //console.group('>>>writeShowing');
    self.dbShowing
      .get(showingID)
      .then(function (doc) {
        //console.log('writeShowing...the showing info EXISTS, pass writing!');
        doc["name"] = showingName;
        doc["clientName"] = clientName;
        doc["showingNote"] = showingNote;
        doc["showingDate"] = showingDate;
        doc["showingTime"] = showingTime;
        self.dbShowing.put(doc);
        return [doc, "showing updated!"];
      })
      .catch(function (err) {
        self.dbShowing
          .put(showing)
          .then(function () {
            //console.log('SAVED the showing info to database:', showing.clientName);
            return self.dbShowing.get(showingID);
          })
          .then(function (doc) {
            //console.log(">>>Showing Info has been saved to dbShowing: ", doc);
          })
          .catch(function (err) {
            //console.log(">>>save showing info error: ", err);
          });
      });
    //console.groupEnd('>>>writeShowing');
  }
}

// export default Database;
