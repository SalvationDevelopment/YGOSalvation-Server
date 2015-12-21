--Armored Gravitation FIXED NYAN TIME MWAHAH AGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIN
function c110000116.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c110000116.condition)
	e1:SetTarget(c110000116.target)
	e1:SetCost(c110000116.cost)
	e1:SetOperation(c110000116.activate)
	c:RegisterEffect(e1)
	Duel.AddCustomActivityCounter(110000116,ACTIVITY_SPSUMMON,c110000116.counterfilter)
end

function c110000116.counterfilter(c)
	return c:IsSetCard(0x3A2E)
end

function c110000116.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetCustomActivityCount(110000116,tp,ACTIVITY_SPSUMMON)==0  end
	local e6=Effect.CreateEffect(e:GetHandler())
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e6:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e6:SetReset(RESET_PHASE+PHASE_END)
	e6:SetTargetRange(1,0)
	e6:SetTarget(c110000116.sumlimit)
	Duel.RegisterEffect(e6,tp)
end

function c110000116.sumlimit(e,c,sump,sumtype,sumpos,targetp,se)
	return not c:IsSetCard(0x3A2E)
end

function c110000116.cfilter(c)
	return c:IsFaceup() and c:IsCode(110000104)
end
function c110000116.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c110000116.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c110000116.filter(c,e,tp)
	return c:IsLevelBelow(4) and c:IsSetCard(0x3A2E) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c110000116.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c110000116.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end



function c110000116.activate(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	if ft<=0 then return end
	if ft>4 then ft=4 end
	local g=Duel.GetMatchingGroup(c110000116.filter,tp,LOCATION_DECK,0,nil,e,tp)
	if g:GetCount()==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g1=g:Select(tp,1,1,nil)
	g:Remove(Card.IsCode,nil,g1:GetFirst():GetCode())
	if g:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(110000116,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g2=g:Select(tp,1,1,nil)
		g:Remove(Card.IsCode,nil,g2:GetFirst():GetCode())
		g1:Merge(g2)
		if g:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(110000116,0)) then
			Duel.Hint(HINT_SELECTMSG,tp,SPSUMMON)
			local g3=g:Select(tp,1,1,nil)
			g:Remove(Card.IsCode,nil,g3:GetFirst():GetCode())
			g1:Merge(g3)
			if g:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(110000116,0)) then
				Duel.Hint(HINT_SELECTMSG,tp,SPSUMMON)
				local g4=g:Select(tp,1,1,nil)
				g1:Merge(g4)
			end
		end
	end
	Duel.SpecialSummon(g1,0,tp,tp,false,false,POS_FACEUP)
end


	
	
	