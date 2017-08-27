var Remittance = artifacts.require("./Remittance.sol");

contract("Remittance", accounts => {

    const alice = accounts[0];
    const carol = accounts[1];
    const sent = 4;

    const bobPw = "0x1111111111111111111111111111111111111111111111111111111111111111"
    const carolPw = "0x2222222222222222222222222222222222222222222222222222222222222222"

    var instance;

    beforeEach(() => {
        return Remittance.deployed().then(oldInstance => {
            return oldInstance.keccakTwo(bobPw, carolPw)
        }).then(pwHash => {
            return Remittance.new(pwHash, carol, {from: alice, value: sent})
        }).then(newInstance => {
            instance = newInstance;
        });
    });

    it("should deploy with balance", () => {
        return instance.balance().then(balance => {
            assert.equal(balance, sent, "balance is not equal to amount sent");
        });
    });

    it("should allow Carol to withdraw with correct passwords", () => {
        return instance.withdraw(bobPw, carolPw, {from: carol}).then(tx => {
            assert.isOk(tx, "Carol's withdrawal failed")
        });
    });

    it("should give Carol the correct amount when she withdraws", () => {
        const beforeEthBalance = web3.eth.getBalance(carol);
        const gasPrice = 10;

        return instance.withdraw(bobPw, carolPw, {from: carol, gasPrice: gasPrice}).then(tx => {
            const weiUsed = tx.receipt.gasUsed * gasPrice;
            const afterEthBalance = web3.eth.getBalance(carol);
            assert.deepEqual(beforeEthBalance.minus(weiUsed).plus(web3.toBigNumber(sent)), afterEthBalance,
                "Carol's wei balance did not increase by amount deposited by Alice");
            return instance.balance();
        }).then(balance => {
            assert.equal(balance, 0, "balance isn't 0 after withdrawal")
        });
    });

});
