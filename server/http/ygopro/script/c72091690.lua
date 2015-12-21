--Painful Escape
--By: HelixReactor
function c72091690.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c72091690.cost)
	e1:SetTarget(c72091690.target)
	e1:SetOperation(c72091690.activate)
	c:RegisterEffect(e1)
end
function c72091690.filter(c)
	return c:IsFaceup() and Duel.IsExistingMatchingCard(c72091690.filter2,c:GetControler(),LOCATION_DECK+LOCATION_GRAVE,0,1,nil,c:GetRace(),c:GetAttribute(),c:GetLevel(),c:GetCode())
end
function c72091690.filter2(c,race,attr,lv,code)
	return c:IsRace(race) and c:IsAttribute(attr) and c:GetLevel()==lv and not c:IsCode(code) and c:IsAbleToHand()
end
function c72091690.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,c72091690.filter,1,nil) end
	local rg=Duel.SelectReleaseGroup(tp,c72091690.filter,1,1,nil)
	Duel.Release(rg,REASON_COST)
	e:SetLabelObject(rg:GetFirst())
end
function c72091690.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c72091690.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c72091690.filter,tp,LOCATION_MZONE,0,1,nil) end
	local tc=e:GetLabelObject()
	Duel.SetTargetCard(tc)
end
function c72091690.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOHAND)
	local g=Duel.SelectMatchingCard(tp,c72091690.filter2,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,tc:GetRace(),tc:GetAttribute(),tc:GetLevel(),tc:GetCode())
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end