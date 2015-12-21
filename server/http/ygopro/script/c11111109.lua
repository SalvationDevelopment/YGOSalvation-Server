--Totem Pole
function c11111109.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c11111109.condition)
	e1:SetTarget(c11111109.target2)
	e1:SetOperation(c11111109.activate)
	c:RegisterEffect(e1)
	--negate
	local e2=Effect.CreateEffect(c)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_ATTACK_ANNOUNCE)
	e2:SetCondition(c11111109.condition)
	e2:SetTarget(c11111109.target2)
	e2:SetOperation(c11111109.activate)
	c:RegisterEffect(e2)
end
function c11111109.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer()
end

function c11111109.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return not e:GetHandler():IsStatus(STATUS_CHAINING)end
	Duel.SetTargetCard(tg)
end
function c11111109.activate(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.NegateAttack()
	end
	local ct=e:GetLabel()
		ct=ct+1
		e:SetLabel(ct)
	if ct==2 then Duel.Destroy(e:GetHandler(),REASON_EFFECT) end
end

