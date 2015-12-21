--Double Passé
function c12368.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_BE_BATTLE_TARGET)
	e1:SetCondition(c12368.condition)
	e1:SetTarget(c12368.target)
	e1:SetOperation(c12368.activate)
	c:RegisterEffect(e1)
end
function c12368.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer() and eg:GetFirst():IsControler(tp)
end
function c12368.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttackTarget()
	if chkc then return chkc==tg end
	if chk==0 then return tg:IsOnField() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
	local dam=tg:GetAttack()
	Duel.SetTargetParam(dam)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,dam)
end
function c12368.activate(e,tp,eg,ep,ev,re,r,rp)
	local tg,d=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS,CHAININFO_TARGET_PARAM)
	local tc=tg:GetFirst()
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.ChangeAttackTarget(nil)
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsAttackable() then
		Duel.Damage(1-tp,d,REASON_EFFECT)
	end	
end
