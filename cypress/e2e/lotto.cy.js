import { ERROR_MESSAGE } from '../../src/const';
import Lotto from '../../src/js/models/lotto';

const lotto = new Lotto();

describe('로또 테스트', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('로또 구입 금액을 입력할 수 있다.', () => {
    context('페이지에 진입했을 때', () => {
      it('입력화면이 노출된다.', () => {
        cy.getInputPrice(1000).should('be.visible');
      });
    });
    context('사용자가 2,000원을 입력했을 때', () => {
      it('2,000원이 입력화면에 입력된다.', () => {
        cy.getInputPrice(2000).should('have.value', 2000);
      });
    });
  });

  describe('잘못된 금액을 입력하면 로또를 구입을 할 수 없다.', () => {
    context('사용자가 금액을 입력했을 때', () => {
      it('1,000원 단위로 입력하지 않은 경우, alert가 노출된다.', () => {
        const stub = cy.stub();
        cy.on('window:alert', stub);
        cy.getInputPrice(1500);
        cy.clickInputPriceButton().then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            ERROR_MESSAGE.INVALID_UNIT_NUMBER
          );
        });
      });

      it('음수일 경우 alert가 노출된다.', () => {
        const stub = cy.stub();
        cy.on('window:alert', stub);
        cy.getInputPrice(-1000);
        cy.clickInputPriceButton().then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            ERROR_MESSAGE.INVALID_NEGATIVE_NUMBER
          );
        });
      });
    });
  });

  describe('소비자는 자동 구매를 할 수 있어야 한다.', () => {
    context('페이지에 진입했을 때', () => {
      it('확인 버튼이 노출된다.', () => {
        cy.clickInputPriceButton().should('be.visible');
      });
    });

    context('사용자가 2,000원 입력 후 확인 버튼을 클릭했을 때', () => {
      it('로또 구매 화면이 노출된다.', () => {
        cy.getInputPrice(2000);
        cy.clickInputPriceButton();
        cy.getPurchasedLottos();
      });

      it('숫자 2가 총 구매 숫자가 된다.', () => {
        cy.getInputPrice(2000);
        cy.clickInputPriceButton().then(() => {
          cy.getTotalPurchased(2);
        });
      });

      it('2개의 로또 아이콘 나열된다.', () => {
        cy.getInputPrice(2000);
        cy.clickInputPriceButton().then(() => {
          cy.getTotalLottoIcon(2);
        });
      });
    });
  });

  describe('복권 번호는 번호보기 토글 버튼을 클릭하여 노출/미노출할 수 있다.', () => {
    context('토글 버튼을 OFF -> ON 으로 변경했을 때', () => {
      it('구매한 로또 개수 아이콘과 로또번호가 노출된다.', () => {
        cy.getInputPrice(2000);
        cy.clickInputPriceButton();
        cy.clickSwitchButton();
        cy.getLottoNumber().should('have.length', 2);
      });

      it('숫자는 중복이 존재하지 않는다.', () => {
        lotto.setPrice(2000);
        lotto.registerLotto();
        const registeredLotto = lotto.lottos[0];
        const uniq = new Set(registeredLotto);
        expect(registeredLotto.length).to.equal(uniq.size);
      });

      it('로또 하나당 숫자는 6개의 숫자가 노출된다.', () => {
        lotto.setPrice(2000);
        lotto.registerLotto();
        const registeredLotto = lotto.lottos[0];
        expect(registeredLotto.length).to.equal(6);
      });
    });

    context('토글 버튼을 ON → OFF 으로 변경했을 때', () => {
      it('로또번호는 가려지며, 구매한 로또 개수 아이콘만 노출된다.', () => {
        cy.getInputPrice(2000);
        cy.clickInputPriceButton();
        cy.clickSwitchButton();
        cy.clickSwitchButton();
        cy.getLottoNumber().should('be.not.visible');
      });
    });
  });

  describe('잘못된 당첨번호를 입력하면 결과확인을 할 수 없다', () => {
    context('당첨번호를 입력하고 결과확인 버튼을 클릭했을 때', () => {
      it('당첨번호는 1 ~ 45 사이 숫자가 아닌 경우 alert가 노출된다.', () => {
        const stub = cy.stub();
        cy.on('window:alert', stub);
        cy.get('#show-result-btn')
          .click()
          .then(() => {
            expect(stub.getCall(0)).to.be.calledWith('');
          });
      });

      it('당첨번호 6개와 보너스 번호 1개 숫자중 중복된 숫자가 존재하면 alert가 노출된다.', () => {
        const stub = cy.stub();
        cy.on('window:alert', stub);
        cy.get('#show-result-btn')
          .click()
          .then(() => {
            expect(stub.getCall(0)).to.be.calledWith('');
          });
      });
    });
  });

  describe('결과 확인하기 버튼을 누르면, 수익율을 모달로 확인할 수 있다.', () => {
    context(
      '올바른 당첨번호를 입력 후 결과 확인하기 버튼을 클릭했을 때',
      () => {
        it('당첨통계 모달이 노출된다.', () => {
          cy.get('#show-result-btn').click();
          cy.get('.modal').should('be.visible');
        });

        it('구매한 로또 번호와 당첨번호를 비교하여 총 수익률이 반영된다.', () => {
          cy.get('#show-result-btn').click();
          cy.get('#profit').should('have.text', 0);
        });
      }
    );
  });

  describe('다시 시작하기 버튼을 누르면 초기화 되서 다시 구매를 시작할 수 있다.', () => {
    context('다시 시작하기 버튼을 클릭했을 때', () => {
      it('당첨통계 모달이 미노출된다.', () => {
        cy.get('#reset-btn').click();
        cy.get('.modal').should('be.not.visible');
      });

      it('구매한 로또 아이콘 화면이 미노출된다.', () => {
        cy.get('#reset-btn').click();
        cy.get('.modal').should('be.not.visible');
        cy.get('#purchased-lottos').should('be.not.visible');
      });

      it('입력한 금액이 초기화 된다.', () => {
        cy.get('#reset-btn').click();
        cy.get('.modal').should('be.not.visible');
        cy.get('#input-price').should('have.value', '');
      });
    });
  });
});
