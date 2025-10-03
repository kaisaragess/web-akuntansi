import { AppDataSource } from "./data-source";
import { ExpressAA, SystemParam } from "./lib-api/expressjs-aa/ExpressAA";
import { implement_DELETE_coa__id } from "./lib-api/implementation/implement_DELETE_coa__id";
import { implement_DELETE_journals__id } from "./lib-api/implementation/implement_DELETE_journals__id";
import { implement_GET_coa } from "./lib-api/implementation/implement_GET_coa";
import { implement_GET_coa__id } from "./lib-api/implementation/implement_GET_coa__id";
import { implement_GET_journals } from "./lib-api/implementation/implement_GET_journals";
import { implement_GET_journals__id } from "./lib-api/implementation/implement_GET_journals__id";
import { implement_POST_coa } from "./lib-api/implementation/implement_POST_coa";
import { implement_POST_journals } from "./lib-api/implementation/implement_POST_journals";
import { implement_POST_login } from "./lib-api/implementation/implement_POST_login";
import { implement_POST_register } from "./lib-api/implementation/implement_POST_register";
import { implement_PUT_coa__id } from "./lib-api/implementation/implement_PUT_coa__id";
import { implement_PUT_journals__id } from "./lib-api/implementation/implement_PUT_journals__id";

const system_param: SystemParam = {
  port: 3001,
  async beforeStart() {
    await AppDataSource.initialize();
  },
};

new ExpressAA().init(system_param).then((e: ExpressAA) => {
    implement_DELETE_coa__id(e),
    implement_DELETE_journals__id(e),
    implement_GET_coa(e),
    implement_GET_coa__id(e),
    implement_GET_journals(e),
    implement_GET_journals__id(e),
    implement_POST_coa(e),
    implement_POST_journals(e),
    implement_POST_login(e),
    implement_POST_register(e),
    implement_PUT_coa__id(e),
    implement_PUT_journals__id(e)
})