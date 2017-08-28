var Remittance = artifacts.require("./Remittance.sol");

require('bluebird').promisifyAll(web3.eth, { suffix: "Promise" });

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
        return web3.eth.getBalancePromise(instance.address).then(balance => {
            assert.equal(balance, sent, "balance is not equal to amount sent");
        });
    });

    it("should allow Carol to withdraw with correct passwords", () => {
        return instance.withdraw(bobPw, carolPw, {from: carol}).then(tx => {
            assert.isOk(tx, "Carol's withdrawal failed")
        });
    });

    it("should give Carol the correct amount when she withdraws", () => {
        const gasPrice = 10;

        var beforeWeiBalance;
        var weiUsed;

        return web3.eth.getBalancePromise(carol).then(balance => {
            beforeWeiBalance = balance;
            return instance.withdraw(bobPw, carolPw, {from: carol, gasPrice: gasPrice});
        }).then(tx => {
            weiUsed = tx.receipt.gasUsed * gasPrice;
            return web3.eth.getBalancePromise(carol);
        }).then(afterWeiBalance => {
            assert.deepEqual(beforeWeiBalance.minus(weiUsed).plus(web3.toBigNumber(sent)), afterWeiBalance,
                "Carol's wei balance did not increase by amount deposited by Alice");
            return web3.eth.getBalancePromise(instance.address);
        }).then(balance => {
            assert.equal(balance, 0, "balance isn't 0 after withdrawal")
        });
    });

});
