--武神器－ヤタ
function c80600023.initial_effect(c)
	--negate attack
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600023,0))
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_BE_BATTLE_TARGET)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c80600023.condition)
	e1:SetCost(c80600023.cost)
	e1:SetTarget(c80600023.target)
	e1:SetOperation(c80600023.operation)
	c:RegisterEffect(e1)
end
function c80600023.condition(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttackTarget()
	return at and at:IsControler(tp) and at:IsFaceup() and at:IsRace(RACE_BEASTWARRIOR) and at:IsSetCard(0x88)
end
function c80600023.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600026)==0 and e:GetHandler():IsAbleToGraveAsCost() end
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
	Duel.RegisterFlagEffect(tp,80600026,RESET_PHASE+PHASE_END,0,1)
end
function c80600023.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end
	local g=Duel.GetAttacker()
	Duel.SetTargetCard(g)
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,tg,1,0,0)
end
function c80600023.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		if Duel.NegateAttack() then
			Duel.Damage(1-tp,tc:GetAttack()/2,REASON_EFFECT)
		end
	end
end