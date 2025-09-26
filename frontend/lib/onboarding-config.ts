//入职流程统一配置
export const cfg={
  steps:['difficulty','learning','interests','concepts','theme'],//流程步骤
  concepts:['SELECT','WHERE','JOINS','GROUP_BY','ORDER_BY','SUBQUERIES','HAVING','COUNT','SUM','AVG'],//SQL概念
  dbMapping:{//数据库字段映射
    difficulty:{Easy:'easy',Medium:'medium',Hard:'hard',Adaptive:'adaptive',简单:'easy',中等:'medium',困难:'hard',自适应:'adaptive'},
    learning:{Guided:'guided',Challenge:'challenge','Step by Step':'step_by_step',引导式:'guided',挑战式:'challenge',逐步式:'step_by_step'},
    interests:{Movies:'movie',Football:'football','E-commerce':'ecommerce',Database:'database',System:'system',Entertainment:'entertainment',Sports:'sports',电影:'movie',足球:'football',电商:'ecommerce',数据库:'database',系统:'system',娱乐:'entertainment',体育:'sports'},
    theme:{Light:'light',Dark:'dark',浅色:'light',深色:'dark'}
  }
}
