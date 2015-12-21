--武神帝―カグツチ
function c80600053.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsRace,RACE_BEASTWARRIOR),4),2)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DECKDES)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c80600053.condition)
	e1:SetCost(c80600053.cost)
	e1:SetOperation(c80600053.operation)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80600053.reptg)
	e2:SetValue(c80600053.repval)
	c:RegisterEffect(e2)
end
function c80600053.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_XYZ
end
function c80600053.cfilter(c)
	return c:IsLocation(LOCATION_GRAVE) and c:IsSetCard(0x88)
end
function c80600053.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDiscardDeckAsCost(tp,5) end
	Duel.DiscardDeck(tp,5,REASON_COST)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(c80600053.cfilter,nil)
	e:SetLabel(ct)
end
function c80600053.operation(e,tp,eg,ep,ev,re,r,rp)
	local ct=e:GetLabel()
	if ct==0 then return end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetReset(RESET_EVENT+0x1ff0000)
	e1:SetValue(ct*100)
	e:GetHandler():RegisterEffect(e1)
end
function c80600053.repfilter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE) 
	and c:IsSetCard(0x88) and c:IsRace(RACE_BEASTWARRIOR)
end
function c80600053.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c80600053.repfilter,1,nil,tp) end
	if e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT) and Duel.SelectYesNo(tp,aux.Stringid(80600053,0)) then
		e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_EFFECT)
		local g=eg:Filter(c80600053.repfilter,nil,tp)
		if g:GetCount()==1 then
			e:SetLabelObject(g:GetFirst())
		else
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESREPLACE)
			local cg=g:Select(tp,1,1,nil)
			e:SetLabelObject(cg:GetFirst())
		end
		return true
	else return false end
end
function c80600053.repval(e,c)
	return c==e:GetLabelObject()
end
