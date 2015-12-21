--Dry Wind
function c65983.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_RECOVER)
	e2:SetCountLimit(1,65983)
	e2:SetCondition(c65983.condition)
	e2:SetTarget(c65983.target)
	e2:SetOperation(c65983.activate)
	c:RegisterEffect(e2)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetCountLimit(1,65984)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCost(c65983.cost)
	e3:SetCondition(c65983.condition2)
	e3:SetOperation(c65983.operation2)
	c:RegisterEffect(e3)
end
function c65983.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp
end
function c65983.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and chkc:IsFaceup() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c65983.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end

function c65983.condition2(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetLP(1-tp)<Duel.GetLP(tp)
end
function c65983.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local dif=Duel.GetLP(tp)-Duel.GetLP(1-tp)
	Duel.PayLPCost(tp,dif)
	e:SetLabel(dif)
end
function c65983.filter(c,atk)
	return c:IsFaceup() and c:IsAttackBelow(atk)
end
function c65983.operation2(e,tp,eg,ep,ev,re,r,rp)
		local val=e:GetLabel()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g1=Duel.SelectMatchingCard(tp,c65983.filter,tp,0,LOCATION_MZONE,1,1,nil,val)
		local sc=g1:GetFirst()
		if sc then
			val=val-sc:GetAttack()
			while  Duel.IsExistingMatchingCard(c65983.filter,tp,0,LOCATION_MZONE,1,sc,val) and Duel.SelectYesNo(tp,aux.Stringid(65983,0)) do
				Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
				local g2=Duel.SelectMatchingCard(tp,c65983.filter,tp,0,LOCATION_MZONE,1,1,g1:GetFirst(),val)
				val=val-g2:GetFirst():GetAttack()
				g1:Merge(g2)
			end
			Duel.Destroy(g1,REASON_EFFECT)
	end
end
