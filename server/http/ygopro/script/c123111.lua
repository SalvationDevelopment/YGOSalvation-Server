--Dark Renewal
function c123111.initial_effect(c)
	--Activate(summon)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DISABLE_SUMMON+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetCost(c123111.cost)
	e1:SetTarget(c123111.target)
	e1:SetOperation(c123111.activate)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EVENT_FLIP_SUMMON_SUCCESS)
	c:RegisterEffect(e2)
	local e3=e1:Clone()
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e3)
end
function c123111.filter(c,e,tp)
	return c:IsRace(RACE_SPELLCASTER) and c:IsLevelAbove(6) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c123111.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(1-tp,aux.TRUE,1,nil)
			and Duel.CheckReleaseGroup(tp,aux.TRUE,1,nil)end
	local g=Duel.SelectReleaseGroup(1-tp,aux.TRUE,1,1,nil)	
	local g2=Duel.SelectReleaseGroup(tp,aux.TRUE,1,1,nil)
	Duel.Release(g,REASON_COST)
	Duel.Release(g2,REASON_COST)
end
function c123111.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return ep~=tp and chkc:GetLocation()==LOCATION_GRAVE and chkc:GetControler()==tp
		and chkc:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	if chk==0 then return ep~=tp and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c123111.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c123111.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c123111.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end





