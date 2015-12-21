--Receive Ace
function c12378.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c12378.condition)
	e1:SetTarget(c12378.target)
	e1:SetOperation(c12378.activate)
	c:RegisterEffect(e1)
end
function c12378.condition(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return at:GetControler()~=tp and Duel.GetAttackTarget()==nil and Duel.IsExistingMatchingCard(c12378.cfilter,tp,LOCATION_GRAVE,0,1,nil)
end
function c12378.cfilter(c)
	return c:IsCode(12377)
end
function c12378.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return tg:IsOnField() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(1500)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,1500)
	Duel.SetTargetPlayer(tp)
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,3)
end
function c12378.activate(e,tp,eg,ep,ev,re,r,rp)
	local tg,d=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS,CHAININFO_TARGET_PARAM)
	local tc=tg:GetFirst()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsAttackable() then
		if Duel.NegateAttack(tc) then
			Duel.Damage(1-tp,d,REASON_EFFECT)
			Duel.DiscardDeck(tp,3,REASON_EFFECT)
		end
	end
end
