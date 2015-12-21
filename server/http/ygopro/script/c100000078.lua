--速攻召喚
function c100000078.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)	
	e1:SetCondition(c100000078.condition)
	e1:SetTarget(c100000078.target)
	e1:SetOperation(c100000078.activate)
	c:RegisterEffect(e1)
end
function c100000078.filter(c)
	return c:IsSummonable(true,nil) or c:IsMSetable(true,nil)
end
function c100000078.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetMatchingGroupCount(c100000078.filter,tp,LOCATION_HAND+LOCATION_MZONE,0,nil)
end
function c100000078.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		if not e:GetHandler():IsStatus(STATUS_CHAINING) then
			local ct=Duel.GetMatchingGroupCount(c100000078.filter,tp,LOCATION_HAND+LOCATION_MZONE,0,nil)
			e:SetLabel(ct)
			return ct>0
		else return e:GetLabel()>0 end
	end
	e:SetLabel(e:GetLabel()-1)	
	local g=Duel.SelectTarget(tp,c100000078.filter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_SUMMON,nil,1,0,0)
end
function c100000078.activate(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SUMMON)
	local tc=Duel.GetFirstTarget()
	if tc then
		local s1=tc:IsSummonable(true,nil)
		local s2=tc:IsMSetable(true,nil)
		if (s1 and s2 and Duel.SelectOption(tp,aux.Stringid(100000078,2),aux.Stringid(100000078,3))==0) or not s2 then
			Duel.Summon(tp,tc,true,nil)
		else
			Duel.MSet(tp,tc,true,nil)
		end
	end
end
